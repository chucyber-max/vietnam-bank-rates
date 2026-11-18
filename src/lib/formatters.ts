/**
 * Vietnamese Currency & Financial Formatting Utilities
 */

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('vi-VN').format(rounded) + ' ₫';
}

export function formatVNDNumberOnly(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
}

export function parseVND(val: string): number {
  if (!val) return 0;
  // Strip non-digit characters
  const clean = val.replace(/[^\d]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    const ty = amount / 1_000_000_000;
    return `${Number.isInteger(ty) ? ty : ty.toFixed(1).replace('.', ',')} tỷ`;
  }
  if (amount >= 1_000_000) {
    const trieu = amount / 1_000_000;
    return `${Number.isInteger(trieu) ? trieu : trieu.toFixed(1).replace('.', ',')} triệu`;
  }
  if (amount >= 1_000) {
    const nghin = amount / 1_000;
    return `${Number.isInteger(nghin) ? nghin : nghin.toFixed(0)} nghìn`;
  }
  return formatVND(amount);
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(2)}%/năm`;
}

export function formatDiffVND(amount: number): string {
  if (amount <= 0) return '0 ₫';
  return `+${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} ₫`;
}
