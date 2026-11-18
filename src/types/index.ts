export type BankGroup = 'ALL' | 'BIG4' | 'TMCP' | 'DIGITAL';

export type BankGroupType = 'BIG4' | 'TMCP' | 'DIGITAL';

export type DepositType = 'ONLINE' | 'COUNTER';

export type SavingsMode = 'MONTHLY' | 'LUMP_SUM';

export type TermMonths = 1 | 3 | 6 | 9 | 12 | 18 | 24;

export interface Bank {
  id: string;
  code: string;
  name: string;
  shortName: string;
  groupType: BankGroupType;
  brandColor: string;
  logoUrl?: string;
  nonTermRate?: number;
}

export interface DepositRate {
  id: string;
  bankId: string;
  depositType: DepositType;
  termMonths: TermMonths;
  ratePercent: number;
  updatedAt: string;
}

export interface MonthlyBreakdownItem {
  month: number;
  label: string;
  monthlyDeposit: number;
  accumulatedPrincipal: number;
  interestEarnedThisMonth: number;
  accumulatedInterest: number;
  totalBalance: number;
}

export interface CalculationResult {
  bank: Bank;
  ratePercent: number;
  totalPrincipal: number;
  totalInterest: number;
  totalReceived: number;
  differenceFromLowest: number;
  differencePercent: number;
  rank: number;
  monthlyBreakdown: MonthlyBreakdownItem[];
}

export interface EarlyWithdrawalResult {
  principal: number;
  daysHeld: number;
  nonTermRate: number;
  actualInterest: number;
  maturityInterest: number;
  lostInterest: number;
  lossPercentage: number;
}

export interface SavingsCalculatorState {
  mode: SavingsMode;
  amount: number;
  termMonths: TermMonths;
  depositType: DepositType;
  groupFilter: BankGroup;
  compoundCycles: number; // For lump-sum compound rollover (1 to 10)
  enableCompound: boolean;
  selectedCompareBankIds: string[];
}

// ==========================================
// LOAN (VAY TIỀN LÃI) TYPES
// ==========================================

export type LoanCategory = 'MORTGAGE' | 'AUTO' | 'UNSECURED';

export type LoanMethod = 'PACKAGE' | 'REDUCING_BALANCE' | 'ANNUITY';

export interface LoanRate {
  id: string;
  bankId: string;
  loanType: LoanCategory;
  promoRate: number;
  promoMonths: number;
  floatingRate: number;
  earlyFeePercent: number;
  updatedAt: string;
}

export interface AmortizationScheduleItem {
  month: number;
  label: string;
  beginningBalance: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
  ratePercent: number;
  isPromo: boolean;
}

export interface LoanCalculationResult {
  bank: Bank;
  loanRate: LoanRate;
  promoRate: number;
  promoMonths: number;
  floatingRate: number;
  effectiveRateAvg: number;
  principal: number;
  termMonths: number;
  firstMonthPayment: number;
  maxMonthlyPayment: number;
  minMonthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  differenceFromLowest: number;
  rank: number;
  schedule: AmortizationScheduleItem[];
}

export interface LoanCalculatorState {
  category: LoanCategory;
  amount: number;
  termMonths: number;
  method: LoanMethod;
  groupFilter: BankGroup;
  sortOrder: 'asc' | 'desc';
}
