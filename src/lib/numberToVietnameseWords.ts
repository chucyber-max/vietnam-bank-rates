/**
 * Converts numeric VND amounts to spoken Vietnamese words
 * Example: 3000000 -> "Ba triệu đồng", 105000000 -> "Một trăm linh năm triệu đồng"
 */

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const UNITS = ['', 'nghìn', 'triệu', 'tỷ'];

function readThreeDigits(num: number, hasHigherUnit: boolean): string {
  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;

  if (num === 0) return '';

  let res = '';

  if (hundreds > 0 || hasHigherUnit) {
    res += `${DIGITS[hundreds]} trăm `;
  }

  if (tens === 0 && ones > 0) {
    if (hundreds > 0 || hasHigherUnit) {
      res += 'linh ';
    }
    res += DIGITS[ones];
  } else if (tens === 1) {
    res += 'mười ';
    if (ones === 5) {
      res += 'lăm';
    } else if (ones > 0) {
      res += DIGITS[ones];
    }
  } else if (tens > 1) {
    res += `${DIGITS[tens]} mươi `;
    if (ones === 1) {
      res += 'mốt';
    } else if (ones === 4) {
      res += 'tư';
    } else if (ones === 5) {
      res += 'lăm';
    } else if (ones > 0) {
      res += DIGITS[ones];
    }
  }

  return res.trim();
}

export function numberToVietnameseWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Không đồng';
  if (amount < 0) return 'Âm ' + numberToVietnameseWords(Math.abs(amount));

  const rounded = Math.round(amount);
  let temp = rounded;
  const groups: number[] = [];

  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let result = '';

  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const readGroup = readThreeDigits(groupVal, i < groups.length - 1);
      const unitIndex = i % 4;
      const billionCount = Math.floor(i / 4);
      let unit = UNITS[unitIndex];
      if (billionCount > 0 && unitIndex === 0) {
        unit = 'tỷ '.repeat(billionCount).trim();
      }
      result += `${readGroup} ${unit} `;
    }
  }

  result = result.trim();
  if (!result) return 'Không đồng';

  // Capitalize first letter and append "đồng"
  const formatted = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
  return formatted.replace(/\s+/g, ' ');
}
