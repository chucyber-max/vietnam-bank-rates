import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_BANKS, MOCK_DEPOSIT_RATES, getRatesForParams } from '@/data/mockRates';
import { Bank, BankGroup, DepositType, TermMonths } from '@/types';

export interface BankRateResult {
  bank: Bank;
  ratePercent: number;
}

export interface FetchRatesResponse {
  data: BankRateResult[];
  source: 'SUPABASE' | 'LOCAL_FALLBACK';
  lastUpdated: string;
}

/**
 * Fetch banks and corresponding deposit rates
 * Seamless fallback to rich local seed data if Supabase is not yet configured or offline.
 */
export async function getBanksAndRates(
  termMonths: TermMonths,
  depositType: DepositType,
  groupFilter: BankGroup = 'ALL'
): Promise<FetchRatesResponse> {
  if (!isSupabaseConfigured || !supabase) {
    const localData = getRatesForParams(termMonths, depositType, groupFilter);
    return {
      data: localData,
      source: 'LOCAL_FALLBACK',
      lastUpdated: '15/01/2025 (Dữ liệu thị trường niêm yết)',
    };
  }

  try {
    // 1. Fetch Banks
    let bankQuery = supabase.from('banks').select('*');
    if (groupFilter !== 'ALL') {
      bankQuery = bankQuery.eq('group_type', groupFilter);
    }
    const { data: banksData, error: bankError } = await bankQuery;
    if (bankError || !banksData || banksData.length === 0) {
      throw bankError || new Error('No banks returned from Supabase');
    }

    // 2. Fetch Rates for given term and deposit type
    const bankIds = banksData.map(b => b.id);
    const { data: ratesData, error: ratesError } = await supabase
      .from('deposit_rates')
      .select('*')
      .in('bank_id', bankIds)
      .eq('term_months', termMonths)
      .eq('deposit_type', depositType);

    if (ratesError || !ratesData) {
      throw ratesError || new Error('No rates returned from Supabase');
    }

    // Map into normalized format
    const rateMap = new Map<string, number>();
    ratesData.forEach((r: any) => {
      rateMap.set(r.bank_id, parseFloat(r.rate_percent));
    });

    const results: BankRateResult[] = banksData.map((b: any) => {
      const bank: Bank = {
        id: b.id,
        code: b.code,
        name: b.name,
        shortName: b.short_name,
        groupType: b.group_type,
        brandColor: b.brand_color,
        logoUrl: b.logo_url,
      };
      return {
        bank,
        ratePercent: rateMap.get(b.id) ?? 0,
      };
    });

    return {
      data: results,
      source: 'SUPABASE',
      lastUpdated: new Date().toLocaleDateString('vi-VN') + ' (Trực tiếp từ Supabase)',
    };
  } catch (err) {
    console.warn('Supabase fetch failed, smoothly falling back to local dataset:', err);
    return {
      data: getRatesForParams(termMonths, depositType, groupFilter),
      source: 'LOCAL_FALLBACK',
      lastUpdated: '15/01/2025 (Dữ liệu thị trường niêm yết)',
    };
  }
}
