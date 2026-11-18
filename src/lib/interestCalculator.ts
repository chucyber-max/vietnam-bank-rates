import {
  Bank,
  CalculationResult,
  EarlyWithdrawalResult,
  MonthlyBreakdownItem,
  SavingsMode,
  TermMonths,
} from '@/types';

/**
 * Calculate Monthly Installment Savings (Gửi tích lũy hàng tháng)
 * Formula:
 * - totalPrincipal = M * n
 * - weightedMonths = (n * (n + 1)) / 2
 * - totalInterest = Math.round(M * (ratePercent / (100 * 12)) * weightedMonths)
 * - totalReceived = totalPrincipal + totalInterest
 */
export function calculateMonthlySavings(
  monthlyAmount: number,
  termMonths: TermMonths,
  ratePercent: number
): {
  totalPrincipal: number;
  totalInterest: number;
  totalReceived: number;
  breakdown: MonthlyBreakdownItem[];
} {
  const n = termMonths;
  const M = monthlyAmount;
  const monthlyRate = ratePercent / (100 * 12);
  const weightedMonths = (n * (n + 1)) / 2;
  const totalPrincipal = M * n;
  const totalInterest = Math.round(M * monthlyRate * weightedMonths);
  const totalReceived = totalPrincipal + totalInterest;

  const breakdown: MonthlyBreakdownItem[] = [];
  let previousAccumInterest = 0;

  for (let m = 1; m <= n; m++) {
    const accumPrincipal = M * m;
    const mWeighted = (m * (m + 1)) / 2;
    const accumInterest = Math.round(M * monthlyRate * mWeighted);
    const monthInterest = accumInterest - previousAccumInterest;
    previousAccumInterest = accumInterest;

    breakdown.push({
      month: m,
      label: `Tháng ${m}`,
      monthlyDeposit: M,
      accumulatedPrincipal: accumPrincipal,
      interestEarnedThisMonth: monthInterest,
      accumulatedInterest: accumInterest,
      totalBalance: accumPrincipal + accumInterest,
    });
  }

  return {
    totalPrincipal,
    totalInterest,
    totalReceived,
    breakdown,
  };
}

/**
 * Calculate Lump-sum Term Deposit (Gửi có kỳ hạn 1 lần)
 * Formulas:
 * Single cycle (k = 1):
 * - totalInterest = Math.round(P * (ratePercent / 100) * (n / 12))
 * - totalReceived = P + totalInterest
 *
 * Compound rollover (k > 1):
 * - totalReceived = Math.round(P * Math.pow(1 + (ratePercent / 100) * (n / 12), k))
 * - totalInterest = totalReceived - P
 */
export function calculateLumpSumSavings(
  principal: number,
  termMonths: TermMonths,
  ratePercent: number,
  enableCompound: boolean = false,
  cycles: number = 1
): {
  totalPrincipal: number;
  totalInterest: number;
  totalReceived: number;
  breakdown: MonthlyBreakdownItem[];
} {
  const P = principal;
  const n = termMonths;
  const k = enableCompound ? Math.max(1, cycles) : 1;
  const termRate = (ratePercent / 100) * (n / 12);

  let totalReceived = 0;
  let totalInterest = 0;

  if (k === 1) {
    totalInterest = Math.round(P * termRate);
    totalReceived = P + totalInterest;
  } else {
    totalReceived = Math.round(P * Math.pow(1 + termRate, k));
    totalInterest = totalReceived - P;
  }

  const breakdown: MonthlyBreakdownItem[] = [];
  const totalMonths = n * k;

  // Generate monthly trajectory
  // For k = 1, simple linear progression month by month
  // For k > 1, each cycle compounds the base
  for (let m = 1; m <= totalMonths; m++) {
    const completedCycles = Math.floor((m - 1) / n);
    const monthsIntoCycle = ((m - 1) % n) + 1;
    
    // Base amount at the beginning of current cycle
    const cycleBase = Math.round(P * Math.pow(1 + termRate, completedCycles));
    // Linear interest earned so far in current cycle
    const currentCycleInterest = Math.round(cycleBase * (ratePercent / 100) * (monthsIntoCycle / 12));
    const currentBalance = cycleBase + currentCycleInterest;
    const currentAccumInterest = currentBalance - P;

    const prevBalance = m === 1 ? P : breakdown[m - 2].totalBalance;
    const interestThisMonth = currentBalance - prevBalance;

    breakdown.push({
      month: m,
      label: totalMonths > 24 ? `T.${m}` : `Tháng ${m}`,
      monthlyDeposit: m === 1 ? P : 0,
      accumulatedPrincipal: P,
      interestEarnedThisMonth: Math.max(0, interestThisMonth),
      accumulatedInterest: currentAccumInterest,
      totalBalance: currentBalance,
    });
  }

  return {
    totalPrincipal: P,
    totalInterest,
    totalReceived,
    breakdown,
  };
}

/**
 * Compare all banks for given parameters and sort descending by totalReceived / ratePercent
 */
export function calculateAllBankRankings(
  banksWithRates: { bank: Bank; ratePercent: number }[],
  mode: SavingsMode,
  amount: number,
  termMonths: TermMonths,
  enableCompound: boolean = false,
  compoundCycles: number = 1
): CalculationResult[] {
  const rawResults = banksWithRates.map(({ bank, ratePercent }) => {
    let result;
    if (mode === 'MONTHLY') {
      result = calculateMonthlySavings(amount, termMonths, ratePercent);
    } else {
      result = calculateLumpSumSavings(amount, termMonths, ratePercent, enableCompound, compoundCycles);
    }

    return {
      bank,
      ratePercent,
      totalPrincipal: result.totalPrincipal,
      totalInterest: result.totalInterest,
      totalReceived: result.totalReceived,
      monthlyBreakdown: result.breakdown,
      differenceFromLowest: 0,
      differencePercent: 0,
      rank: 1,
    };
  });

  // Sort descending by totalReceived, then by ratePercent, then by bank code
  rawResults.sort((a, b) => {
    if (b.totalReceived !== a.totalReceived) {
      return b.totalReceived - a.totalReceived;
    }
    if (b.ratePercent !== a.ratePercent) {
      return b.ratePercent - a.ratePercent;
    }
    return a.bank.name.localeCompare(b.bank.name);
  });

  // Assign ranks & calculate delta from lowest
  const lowestReceived = rawResults.length > 0 ? rawResults[rawResults.length - 1].totalReceived : 0;
  const lowestInterest = rawResults.length > 0 ? rawResults[rawResults.length - 1].totalInterest : 0;

  return rawResults.map((item, index) => {
    const diff = Math.max(0, item.totalReceived - lowestReceived);
    const diffPct = lowestInterest > 0 ? (diff / lowestInterest) * 100 : 0;

    return {
      ...item,
      rank: index + 1,
      differenceFromLowest: diff,
      differencePercent: Number(diffPct.toFixed(1)),
    };
  });
}

/**
 * Mode C: Calculate Early Withdrawal Penalty / Loss
 * Non-term rate is usually 0.1% - 0.5% / year (Circular 04/2022/TT-NHNN)
 * Interest = P * (nonTermRate / 100) * (days / 365)
 */
export function calculateEarlyWithdrawal(
  principal: number,
  termMonths: TermMonths,
  termRatePercent: number,
  daysHeld: number,
  nonTermRatePercent: number = 0.20
): EarlyWithdrawalResult {
  const P = principal;
  const maturityInterest = Math.round(P * (termRatePercent / 100) * (termMonths / 12));
  const actualInterest = Math.round(P * (nonTermRatePercent / 100) * (daysHeld / 365));
  const lostInterest = Math.max(0, maturityInterest - actualInterest);
  const lossPercentage = maturityInterest > 0 ? (lostInterest / maturityInterest) * 100 : 0;

  return {
    principal: P,
    daysHeld,
    nonTermRate: nonTermRatePercent,
    actualInterest,
    maturityInterest,
    lostInterest,
    lossPercentage: Math.min(100, Number(lossPercentage.toFixed(1))),
  };
}
