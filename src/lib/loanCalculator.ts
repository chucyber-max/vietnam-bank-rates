import {
  Bank,
  LoanCalculationResult,
  LoanCategory,
  LoanMethod,
  LoanRate,
  AmortizationScheduleItem,
} from '@/types';

/**
 * Standard PMT function for Annuity loan calculation
 */
function calculatePMT(principal: number, monthlyRate: number, remainingMonths: number): number {
  if (monthlyRate === 0) return principal / remainingMonths;
  const factor = Math.pow(1 + monthlyRate, remainingMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Calculate full amortization schedule and summary metrics for a bank loan package
 */
export function calculateLoanAmortization(
  principal: number,
  termMonths: number,
  promoRate: number,
  promoMonths: number,
  floatingRate: number,
  method: LoanMethod = 'PACKAGE'
): {
  firstMonthPayment: number;
  maxMonthlyPayment: number;
  minMonthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  effectiveRateAvg: number;
  schedule: AmortizationScheduleItem[];
} {
  const P = principal;
  const N = Math.max(1, termMonths);
  const effectivePromoMonths = Math.min(N, Math.max(0, promoMonths));

  const schedule: AmortizationScheduleItem[] = [];
  let remainingBalance = P;
  let totalInterest = 0;
  let firstMonthPayment = 0;
  let maxMonthlyPayment = 0;
  let minMonthlyPayment = Infinity;
  let sumAnnualRates = 0;

  if (method === 'ANNUITY') {
    // 2-Phase Annuity Loan (Trả góp đều định kỳ)
    let currentMonthlyRate = promoRate / (100 * 12);
    let currentPMT = Math.round(calculatePMT(P, currentMonthlyRate, N));

    for (let k = 1; k <= N; k++) {
      const isPromo = k <= effectivePromoMonths;
      const annualRate = isPromo ? promoRate : floatingRate;
      sumAnnualRates += annualRate;
      const monthlyRate = annualRate / (100 * 12);

      // Recalculate PMT at start of Phase 2 (floating rate period)
      if (k === effectivePromoMonths + 1 && k <= N) {
        currentMonthlyRate = monthlyRate;
        const remainingMonths = N - effectivePromoMonths;
        currentPMT = Math.round(calculatePMT(remainingBalance, currentMonthlyRate, remainingMonths));
      }

      const beginningBalance = remainingBalance;
      const interestPayment = Math.round(beginningBalance * monthlyRate);
      let principalPayment = currentPMT - interestPayment;

      // Adjust last month rounding
      if (k === N || principalPayment > beginningBalance) {
        principalPayment = beginningBalance;
      }

      const totalPayment = principalPayment + interestPayment;
      remainingBalance = Math.max(0, beginningBalance - principalPayment);
      totalInterest += interestPayment;

      if (k === 1) firstMonthPayment = totalPayment;
      if (totalPayment > maxMonthlyPayment) maxMonthlyPayment = totalPayment;
      if (totalPayment < minMonthlyPayment) minMonthlyPayment = totalPayment;

      schedule.push({
        month: k,
        label: `Tháng ${k}`,
        beginningBalance,
        principalPayment,
        interestPayment,
        totalPayment,
        remainingBalance,
        ratePercent: annualRate,
        isPromo,
      });
    }
  } else {
    // REDUCING_BALANCE and PACKAGE (Dư nợ giảm dần: Gốc chia đều hàng tháng, lãi tính trên dư nợ còn lại)
    const baseMonthlyPrincipal = Math.floor(P / N);

    for (let k = 1; k <= N; k++) {
      const isPromo = k <= effectivePromoMonths;
      const annualRate = isPromo ? promoRate : floatingRate;
      sumAnnualRates += annualRate;
      const monthlyRate = annualRate / (100 * 12);

      const beginningBalance = remainingBalance;
      const interestPayment = Math.round(beginningBalance * monthlyRate);

      // Ensure last month clears exact remaining balance
      const principalPayment = k === N ? beginningBalance : baseMonthlyPrincipal;
      const totalPayment = principalPayment + interestPayment;

      remainingBalance = Math.max(0, beginningBalance - principalPayment);
      totalInterest += interestPayment;

      if (k === 1) firstMonthPayment = totalPayment;
      if (totalPayment > maxMonthlyPayment) maxMonthlyPayment = totalPayment;
      if (totalPayment < minMonthlyPayment) minMonthlyPayment = totalPayment;

      schedule.push({
        month: k,
        label: `Tháng ${k}`,
        beginningBalance,
        principalPayment,
        interestPayment,
        totalPayment,
        remainingBalance,
        ratePercent: annualRate,
        isPromo,
      });
    }
  }

  const effectiveRateAvg = Number((sumAnnualRates / N).toFixed(2));
  const totalRepayment = P + totalInterest;

  return {
    firstMonthPayment,
    maxMonthlyPayment,
    minMonthlyPayment: minMonthlyPayment === Infinity ? firstMonthPayment : minMonthlyPayment,
    totalInterest,
    totalRepayment,
    effectiveRateAvg,
    schedule,
  };
}

/**
 * Compare all banks for loan parameters, compute metrics and sort
 */
export function calculateAllLoanRankings(
  banksWithLoanRates: { bank: Bank; loanRate: LoanRate }[],
  principal: number,
  termMonths: number,
  method: LoanMethod = 'PACKAGE',
  sortOrder: 'asc' | 'desc' = 'asc'
): LoanCalculationResult[] {
  const rawResults = banksWithLoanRates.map(({ bank, loanRate }) => {
    const {
      firstMonthPayment,
      maxMonthlyPayment,
      minMonthlyPayment,
      totalInterest,
      totalRepayment,
      effectiveRateAvg,
      schedule,
    } = calculateLoanAmortization(
      principal,
      termMonths,
      loanRate.promoRate,
      loanRate.promoMonths,
      loanRate.floatingRate,
      method
    );

    return {
      bank,
      loanRate,
      promoRate: loanRate.promoRate,
      promoMonths: loanRate.promoMonths,
      floatingRate: loanRate.floatingRate,
      effectiveRateAvg,
      principal,
      termMonths,
      firstMonthPayment,
      maxMonthlyPayment,
      minMonthlyPayment,
      totalInterest,
      totalRepayment,
      differenceFromLowest: 0,
      rank: 1,
      schedule,
    };
  });

  // Sort by totalInterest
  rawResults.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.totalInterest - b.totalInterest;
    } else {
      return b.totalInterest - a.totalInterest;
    }
  });

  const lowestInterest = Math.min(...rawResults.map(r => r.totalInterest));

  return rawResults.map((item, index) => {
    const diff = Math.max(0, item.totalInterest - lowestInterest);
    return {
      ...item,
      rank: index + 1,
      differenceFromLowest: diff,
    };
  });
}
