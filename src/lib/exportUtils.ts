import {
  CalculationResult,
  SavingsMode,
  TermMonths,
  LoanCalculationResult,
  AmortizationScheduleItem,
} from '@/types';
import { formatVND } from './formatters';

/**
 * Exports calculation results or side-by-side comparisons to CSV with UTF-8 BOM
 */
export function exportResultsToCSV(
  results: CalculationResult[],
  mode: SavingsMode,
  termMonths: TermMonths,
  depositType: string,
  amount: number
) {
  const headers = [
    'Thứ hạng',
    'Mã ngân hàng',
    'Tên ngân hàng',
    'Nhóm',
    'Kỳ hạn (tháng)',
    'Hình thức',
    'Lãi suất (%/năm)',
    'Tổng vốn gốc (VND)',
    'Tiền lãi nhận được (VND)',
    'Tổng tiền thực nhận (VND)',
    'Chênh lệch so với thấp nhất (VND)',
  ];

  const rows = results.map(r => [
    r.rank,
    r.bank.code,
    `"${r.bank.name}"`,
    r.bank.groupType,
    termMonths,
    depositType === 'ONLINE' ? 'Online' : 'Tại quầy',
    r.ratePercent,
    r.totalPrincipal,
    r.totalInterest,
    r.totalReceived,
    r.differenceFromLowest,
  ]);

  const csvContent = [
    `# BẢNG SO SÁNH LÃI SUẤT TIẾT KIỆM VIỆT NAM`,
    `# Chế độ: ${mode === 'MONTHLY' ? 'Gửi tích lũy hàng tháng' : 'Gửi một lần'}`,
    `# Số tiền: ${formatVND(amount)} - Kỳ hạn: ${termMonths} tháng - Kênh: ${depositType}`,
    `# Ngày xuất: ${new Date().toLocaleString('vi-VN')}`,
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `so-sanh-lai-suat-${termMonths}thang-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBreakdownToCSV(
  bankName: string,
  breakdown: Array<{
    month: number;
    label: string;
    accumulatedPrincipal: number;
    interestEarnedThisMonth: number;
    accumulatedInterest: number;
    totalBalance: number;
  }>
) {
  const headers = [
    'Kỳ/Tháng',
    'Gốc tích lũy (VND)',
    'Lãi sinh ra kỳ này (VND)',
    'Lãi lũy kế (VND)',
    'Tổng số dư thực nhận (VND)',
  ];

  const rows = breakdown.map(b => [
    `"${b.label}"`,
    b.accumulatedPrincipal,
    b.interestEarnedThisMonth,
    b.accumulatedInterest,
    b.totalBalance,
  ]);

  const csvContent = [
    `# BẢNG TIẾN ĐỘ TÍCH LŨY CHI TIẾT - ${bankName}`,
    `# Ngày xuất: ${new Date().toLocaleString('vi-VN')}`,
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tien-do-tich-luy-${bankName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export loan amortization schedule to CSV with UTF-8 BOM
 */
export function exportLoanScheduleToCSV(
  bankName: string,
  principal: number,
  termMonths: number,
  schedule: AmortizationScheduleItem[]
) {
  const headers = [
    'Kỳ',
    'Tháng',
    'Dư nợ đầu kỳ (VND)',
    'Gốc trả hàng tháng (VND)',
    'Lãi trả hàng tháng (VND)',
    'Tổng tiền trả hàng tháng (VND)',
    'Dư nợ còn lại cuối kỳ (VND)',
    'Lãi suất áp dụng (%/năm)',
    'Giai đoạn',
  ];

  const rows = schedule.map(s => [
    s.month,
    `"${s.label}"`,
    s.beginningBalance,
    s.principalPayment,
    s.interestPayment,
    s.totalPayment,
    s.remainingBalance,
    s.ratePercent,
    s.isPromo ? 'Ưu đãi' : 'Thả nổi',
  ]);

  const csvContent = [
    `# LỊCH TRẢ NỢ VAY CHI TIẾT - ${bankName.toUpperCase()}`,
    `# Số tiền vay: ${formatVND(principal)} - Thời hạn: ${termMonths} tháng`,
    `# Ngày xuất: ${new Date().toLocaleString('vi-VN')}`,
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `lich-tra-no-${bankName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export loan rankings comparison table to CSV with UTF-8 BOM
 */
export function exportLoanRankingsToCSV(
  rankings: LoanCalculationResult[],
  categoryLabel: string,
  principal: number,
  termMonths: number
) {
  const headers = [
    'Thứ hạng',
    'Mã NH',
    'Tên ngân hàng',
    'Nhóm',
    'LS Ưu đãi (%/năm)',
    'Số tháng ưu đãi',
    'LS Thả nổi (%/năm)',
    'Trả tháng đầu (VND)',
    'Trả tháng cao nhất (VND)',
    'Tổng lãi phải trả (VND)',
    'Tổng gốc + lãi (VND)',
    'Chênh lệch so với thấp nhất (VND)',
  ];

  const rows = rankings.map(r => [
    r.rank,
    r.bank.code,
    `"${r.bank.name}"`,
    r.bank.groupType,
    r.promoRate,
    r.promoMonths,
    r.floatingRate,
    r.firstMonthPayment,
    r.maxMonthlyPayment,
    r.totalInterest,
    r.totalRepayment,
    r.differenceFromLowest,
  ]);

  const csvContent = [
    `# BẢNG SO SÁNH GÓI VAY NGÂN HÀNG VIỆT NAM`,
    `# Loại hình vay: ${categoryLabel} - Số tiền: ${formatVND(principal)} - Kỳ hạn: ${termMonths} tháng`,
    `# Ngày xuất: ${new Date().toLocaleString('vi-VN')}`,
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `so-sanh-lai-suat-vay-${termMonths}thang-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
