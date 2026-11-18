import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_BANKS } from '@/data/mockRates';
import { MOCK_LOAN_RATES, getMockLoanRates } from '@/data/mockLoanRates';
import { Bank, BankGroup, LoanCategory, LoanRate } from '@/types';

export interface BankLoanRateItem {
  bank: Bank;
  loanRate: LoanRate;
}

export interface FetchLoanRatesResponse {
  data: BankLoanRateItem[];
  source: 'SUPABASE' | 'LOCAL_FALLBACK';
  lastUpdated: string;
}

/**
 * Fetch banks and corresponding loan interest rates (Mortgage, Auto, Unsecured)
 * Seamless fallback to rich local dataset if Supabase is offline or table is unpopulated.
 */
export async function getBanksAndLoanRates(
  category: LoanCategory = 'MORTGAGE',
  groupFilter: BankGroup = 'ALL'
): Promise<FetchLoanRatesResponse> {
  const getLocalFallback = (): BankLoanRateItem[] => {
    const mockRates = getMockLoanRates(category);
    const filteredBanks = groupFilter === 'ALL'
      ? MOCK_BANKS
      : MOCK_BANKS.filter(b => b.groupType === groupFilter);

    return filteredBanks.map(bank => {
      const rateEntry = mockRates.find(r => r.bankId === bank.id) || {
        id: `loan-${bank.code}-${category.toLowerCase()}`,
        bankId: bank.id,
        loanType: category,
        promoRate: bank.groupType === 'BIG4' ? 5.6 : 6.8,
        promoMonths: 12,
        floatingRate: bank.groupType === 'BIG4' ? 9.3 : 10.8,
        earlyFeePercent: 1.5,
        updatedAt: '2025-01-15T08:00:00Z',
      };
      return {
        bank,
        loanRate: rateEntry,
      };
    });
  };

  if (!isSupabaseConfigured || !supabase) {
    return {
      data: getLocalFallback(),
      source: 'LOCAL_FALLBACK',
      lastUpdated: 'Thị trường vay tiêu dùng & thế chấp 2025',
    };
  }

  try {
    // 1. Fetch Banks
    let bankQuery = supabase.from('banks').select('*');
    if (groupFilter !== 'ALL') {
      bankQuery = bankQuery.eq('group_type', groupFilter);
    }
    const { data: banksData, error: bankErr } = await bankQuery;
    if (bankErr || !banksData || banksData.length === 0) {
      throw bankErr || new Error('No banks found');
    }

    // 2. Fetch loan_rates
    const bankIds = banksData.map(b => b.id);
    const { data: loanRatesData, error: loanErr } = await supabase
      .from('loan_rates')
      .select('*')
      .in('bank_id', bankIds)
      .eq('loan_type', category);

    if (loanErr || !loanRatesData || loanRatesData.length === 0) {
      // Fallback if table is not populated yet
      return {
        data: getLocalFallback(),
        source: 'LOCAL_FALLBACK',
        lastUpdated: 'Thị trường vay tiêu dùng & thế chấp 2025',
      };
    }

    const rateMap = new Map<string, LoanRate>();
    loanRatesData.forEach((r: any) => {
      rateMap.set(r.bank_id, {
        id: r.id,
        bankId: r.bank_id,
        loanType: r.loan_type,
        promoRate: parseFloat(r.promo_rate),
        promoMonths: r.promo_months || 12,
        floatingRate: parseFloat(r.floating_rate),
        earlyFeePercent: parseFloat(r.early_fee_percent || '1.5'),
        updatedAt: r.updated_at || new Date().toISOString(),
      });
    });

    const results: BankLoanRateItem[] = banksData.map((b: any) => {
      const bank: Bank = {
        id: b.id,
        code: b.code,
        name: b.name,
        shortName: b.short_name,
        groupType: b.group_type,
        brandColor: b.brand_color,
        logoUrl: b.logo_url,
      };

      const loanRate = rateMap.get(b.id) || {
        id: `loan-${b.code}-${category.toLowerCase()}`,
        bankId: b.id,
        loanType: category,
        promoRate: b.group_type === 'BIG4' ? 5.6 : 6.8,
        promoMonths: 12,
        floatingRate: b.group_type === 'BIG4' ? 9.3 : 10.8,
        earlyFeePercent: 1.5,
        updatedAt: '2025-01-15T08:00:00Z',
      };

      return { bank, loanRate };
    });

    return {
      data: results,
      source: 'SUPABASE',
      lastUpdated: new Date().toLocaleDateString('vi-VN') + ' (Trực tiếp từ Supabase)',
    };
  } catch (error) {
    console.warn('Loan rates fetch fallback:', error);
    return {
      data: getLocalFallback(),
      source: 'LOCAL_FALLBACK',
      lastUpdated: 'Thị trường vay tiêu dùng & thế chấp 2025',
    };
  }
}
