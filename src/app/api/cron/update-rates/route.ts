import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import * as cheerio from 'cheerio';

interface RateUpdateItem {
  bank_id: string;
  deposit_type: 'ONLINE' | 'COUNTER';
  term_months: number;
  rate_percent: number;
}

interface LoanRateUpdateItem {
  bank_id: string;
  loan_type: 'MORTGAGE' | 'AUTO' | 'UNSECURED';
  promo_rate: number;
  promo_months: number;
  floating_rate: number;
  early_fee_percent: number;
}

// Decode WebGia hex encoded rating strings (e.g. "32MV2Uc3D63M0GJV" -> 2.6)
function decodeWebGia(r: string | undefined): number | null {
  if (!r) return null;
  const cleanHex = r.replace(/[A-Z]/g, '');
  const bytes: number[] = [];
  for (let t = 0; t < cleanHex.length - 1; t += 2) {
    bytes.push(parseInt(cleanHex.substr(t, 2), 16));
  }
  const str = String.fromCharCode.apply(String, bytes);
  if (!str || str.trim() === '-') return null;
  const val = parseFloat(str.replace(',', '.'));
  return isNaN(val) ? null : val;
}

// Normalized Vietnamese Bank Name mapping to our canonical bank codes
const BANK_NAME_MAP: Record<string, string> = {
  vietcombank: 'VCB',
  vcbneo: 'VCB',
  vcb: 'VCB',
  bidv: 'BIDV',
  vietinbank: 'CTG',
  ctg: 'CTG',
  agribank: 'AGR',
  agr: 'AGR',
  techcombank: 'TCB',
  tcb: 'TCB',
  mb: 'MBB',
  mbbank: 'MBB',
  mbb: 'MBB',
  vpbank: 'VPB',
  vpb: 'VPB',
  acb: 'ACB',
  tpbank: 'TPB',
  tpb: 'TPB',
  msb: 'MSB',
  ocb: 'OCB',
  lienvietpostbank: 'LPB',
  lpbank: 'LPB',
  locphat: 'LPB',
  pgbank: 'PGB',
  pgb: 'PGB',
  cake: 'CAKE',
};

const VALID_TERMS = [1, 3, 6, 9, 12, 18, 24];

/**
 * 1. GET Handler: Automated Cron Scraper & Database Sync
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const adminSecret = process.env.ADMIN_SECRET;
    const adminPasswordHeader = request.headers.get('x-admin-password');
    const secretQuery = request.nextUrl.searchParams.get('secret');

    const expectedBearer = cronSecret ? `Bearer ${cronSecret}` : null;
    const isAuthorized =
      (expectedBearer && authHeader === expectedBearer) ||
      (cronSecret && secretQuery === cronSecret) ||
      (adminSecret && adminPasswordHeader === adminSecret) ||
      (adminSecret && authHeader === `Bearer ${adminSecret}`);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing authorization secret' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch bank mappings from Supabase
    const { data: banks, error: bankError } = await supabase
      .from('banks')
      .select('id, code');

    if (bankError || !banks || banks.length === 0) {
      return NextResponse.json(
        { error: 'Failed to retrieve banks from database: ' + (bankError?.message || 'Empty banks table') },
        { status: 500 }
      );
    }

    const codeToBankId = new Map<string, string>();
    banks.forEach((b: { id: string; code: string }) => {
      codeToBankId.set(b.code.toUpperCase(), b.id);
    });

    // 2. Fetch HTML from WebGia with no-store cache and desktop User-Agent
    const webGiaRes = await fetch('https://webgia.com/lai-suat/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi,en;q=0.9',
      },
      cache: 'no-store',
    });

    if (!webGiaRes.ok) {
      return NextResponse.json(
        { error: `WebGia fetch failed with status: ${webGiaRes.status}` },
        { status: 502 }
      );
    }

    const html = await webGiaRes.text();
    const $ = cheerio.load(html);

    // Table 0: Tại quầy (COUNTER), Table 1: Trực tuyến (ONLINE)
    const tables: { type: 'COUNTER' | 'ONLINE'; index: number }[] = [
      { type: 'COUNTER', index: 0 },
      { type: 'ONLINE', index: 1 },
    ];

    const ratesToUpsert: RateUpdateItem[] = [];
    const nowIso = new Date().toISOString();
    const recordedDate = nowIso.split('T')[0]; // YYYY-MM-DD

    tables.forEach(({ type, index }) => {
      const table = $('table').eq(index);
      if (!table.length) return;

      // Map column positions from table header row
      const termColMap: Record<number, number> = {};
      table
        .find('tr')
        .eq(1)
        .find('th, td')
        .each((colIdx, th) => {
          const text = $(th).text().trim().toLowerCase();
          if (text.includes('01') || text === '1 tháng') termColMap[colIdx + 1] = 1;
          else if (text.includes('03') || text === '3 tháng') termColMap[colIdx + 1] = 3;
          else if (text.includes('06') || text === '6 tháng') termColMap[colIdx + 1] = 6;
          else if (text.includes('09') || text === '9 tháng') termColMap[colIdx + 1] = 9;
          else if (text.includes('12') || text === '12 tháng') termColMap[colIdx + 1] = 12;
          else if (text.includes('18') || text === '18 tháng') termColMap[colIdx + 1] = 18;
          else if (text.includes('24') || text === '24 tháng') termColMap[colIdx + 1] = 24;
        });

      table.find('tbody tr, tr').slice(2).each((_, tr) => {
        const firstCol = $(tr).find('td').eq(0);
        const rawName = firstCol.text().trim();
        if (!rawName) return;

        const normalized = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const bankCode = BANK_NAME_MAP[normalized];
        if (!bankCode) return;

        const bankId = codeToBankId.get(bankCode);
        if (!bankId) return;

        $(tr).find('td').slice(1).each((tdIdx, td) => {
          const colIndex = tdIdx + 1;
          const term = termColMap[colIndex];
          if (!term || !VALID_TERMS.includes(term)) return;

          const nbAttr = $(td).attr('nb');
          const decodedRate = decodeWebGia(nbAttr);

          if (decodedRate !== null && decodedRate > 0 && decodedRate < 20) {
            ratesToUpsert.push({
              bank_id: bankId,
              deposit_type: type,
              term_months: term,
              rate_percent: decodedRate,
            });
          }
        });
      });
    });

    if (ratesToUpsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid rates were extracted from WebGia' },
        { status: 500 }
      );
    }

    // Deduplicate in case of duplicate scraped cells
    const uniqueMap = new Map<string, RateUpdateItem>();
    ratesToUpsert.forEach(item => {
      const key = `${item.bank_id}_${item.deposit_type}_${item.term_months}`;
      uniqueMap.set(key, item);
    });
    const finalRates = Array.from(uniqueMap.values());

    // 3. Upsert into deposit_rates
    const depositRows = finalRates.map(r => ({
      bank_id: r.bank_id,
      deposit_type: r.deposit_type,
      term_months: r.term_months,
      rate_percent: r.rate_percent,
      updated_at: nowIso,
    }));

    const { error: depositUpsertError } = await supabase
      .from('deposit_rates')
      .upsert(depositRows, {
        onConflict: 'bank_id,deposit_type,term_months',
      });

    if (depositUpsertError) {
      return NextResponse.json(
        { error: 'Failed to upsert into deposit_rates: ' + depositUpsertError.message },
        { status: 500 }
      );
    }

    // 4. Upsert snapshot into rate_history
    const historyRows = finalRates.map(r => ({
      bank_id: r.bank_id,
      deposit_type: r.deposit_type,
      term_months: r.term_months,
      rate_percent: r.rate_percent,
      recorded_date: recordedDate,
    }));

    const { error: historyUpsertError } = await supabase
      .from('rate_history')
      .upsert(historyRows, {
        onConflict: 'bank_id,deposit_type,term_months,recorded_date',
      });

    if (historyUpsertError) {
      console.warn('Warning: rate_history upsert encountered an error:', historyUpsertError.message);
    }

    return NextResponse.json({
      success: true,
      updatedCount: finalRates.length,
      timestamp: nowIso,
    });
  } catch (error: any) {
    console.error('Cron rate sync error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * 2. POST Handler: Manual Admin Batch Matrix Update
 */
export async function POST(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    const expectedSecret = process.env.ADMIN_SECRET;

    if (!expectedSecret || adminPassword !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin password' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid payload: request body is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();
    const recordedDate = nowIso.split('T')[0];

    // Case A: Loan Rates Batch Update
    if (Array.isArray(body.loanUpdates) && body.loanUpdates.length > 0) {
      const loanUpdates: LoanRateUpdateItem[] = body.loanUpdates;

      for (const item of loanUpdates) {
        if (!item.bank_id) {
          return NextResponse.json({ error: 'Missing bank_id in loan update item' }, { status: 400 });
        }
        if (!['MORTGAGE', 'AUTO', 'UNSECURED'].includes(item.loan_type)) {
          return NextResponse.json({ error: `Invalid loan_type: ${item.loan_type}` }, { status: 400 });
        }
        if (typeof item.promo_rate !== 'number' || item.promo_rate < 0 || item.promo_rate > 30) {
          return NextResponse.json(
            { error: `Invalid promo_rate for bank ${item.bank_id}: ${item.promo_rate}` },
            { status: 400 }
          );
        }
        if (typeof item.floating_rate !== 'number' || item.floating_rate < 0 || item.floating_rate > 30) {
          return NextResponse.json(
            { error: `Invalid floating_rate for bank ${item.bank_id}: ${item.floating_rate}` },
            { status: 400 }
          );
        }
      }

      const loanRows = loanUpdates.map(item => ({
        bank_id: item.bank_id,
        loan_type: item.loan_type,
        promo_rate: Number(item.promo_rate.toFixed(2)),
        promo_months: item.promo_months || 12,
        floating_rate: Number(item.floating_rate.toFixed(2)),
        early_fee_percent: Number((item.early_fee_percent ?? 1.5).toFixed(2)),
        updated_at: nowIso,
      }));

      const { error: loanError } = await supabase
        .from('loan_rates')
        .upsert(loanRows, {
          onConflict: 'bank_id,loan_type',
        });

      if (loanError) {
        return NextResponse.json(
          { error: 'Database update failed on loan_rates: ' + loanError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        type: 'LOAN',
        count: loanUpdates.length,
        timestamp: nowIso,
      });
    }

    // Case B: Deposit Rates Batch Update
    if (!Array.isArray(body.updates) || body.updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: "updates" or "loanUpdates" array is required and must not be empty' },
        { status: 400 }
      );
    }

    const updates: RateUpdateItem[] = body.updates;

    // Validate each item
    for (const item of updates) {
      if (!item.bank_id) {
        return NextResponse.json({ error: 'Missing bank_id in update item' }, { status: 400 });
      }
      if (!['ONLINE', 'COUNTER'].includes(item.deposit_type)) {
        return NextResponse.json({ error: `Invalid deposit_type: ${item.deposit_type}` }, { status: 400 });
      }
      if (!VALID_TERMS.includes(item.term_months)) {
        return NextResponse.json({ error: `Invalid term_months: ${item.term_months}` }, { status: 400 });
      }
      if (typeof item.rate_percent !== 'number' || item.rate_percent <= 0 || item.rate_percent >= 20) {
        return NextResponse.json(
          { error: `Invalid rate_percent for bank ${item.bank_id}: ${item.rate_percent}. Must be between 0 and 20.` },
          { status: 400 }
        );
      }
    }

    // Batch upsert into deposit_rates
    const depositRows = updates.map(item => ({
      bank_id: item.bank_id,
      deposit_type: item.deposit_type,
      term_months: item.term_months,
      rate_percent: Number(item.rate_percent.toFixed(2)),
      updated_at: nowIso,
    }));

    const { error: depositError } = await supabase
      .from('deposit_rates')
      .upsert(depositRows, {
        onConflict: 'bank_id,deposit_type,term_months',
      });

    if (depositError) {
      return NextResponse.json(
        { error: 'Database update failed on deposit_rates: ' + depositError.message },
        { status: 500 }
      );
    }

    // Batch upsert into rate_history
    const historyRows = updates.map(item => ({
      bank_id: item.bank_id,
      deposit_type: item.deposit_type,
      term_months: item.term_months,
      rate_percent: Number(item.rate_percent.toFixed(2)),
      recorded_date: recordedDate,
    }));

    const { error: historyError } = await supabase
      .from('rate_history')
      .upsert(historyRows, {
        onConflict: 'bank_id,deposit_type,term_months,recorded_date',
      });

    if (historyError) {
      console.warn('Warning: rate_history upsert encountered an error:', historyError.message);
    }

    return NextResponse.json({
      success: true,
      type: 'DEPOSIT',
      count: updates.length,
      timestamp: nowIso,
    });
  } catch (error: any) {
    console.error('Admin rate update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
