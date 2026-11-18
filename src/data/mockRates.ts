import { Bank, DepositRate, BankGroup, TermMonths, DepositType } from '@/types';

export const MOCK_BANKS: Bank[] = [
  // 1. Big4 Banks
  {
    id: 'b0000001-0000-0000-0000-000000000001',
    code: 'VCB',
    name: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    shortName: 'Vietcombank',
    groupType: 'BIG4',
    brandColor: '#005A3C', // Emerald Green
  },
  {
    id: 'b0000001-0000-0000-0000-000000000002',
    code: 'BIDV',
    name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    shortName: 'BIDV',
    groupType: 'BIG4',
    brandColor: '#002D62', // Deep Navy
  },
  {
    id: 'b0000001-0000-0000-0000-000000000003',
    code: 'AGR',
    name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
    shortName: 'Agribank',
    groupType: 'BIG4',
    brandColor: '#8B1D41', // Burgundy
  },
  {
    id: 'b0000001-0000-0000-0000-000000000004',
    code: 'CTG',
    name: 'Ngân hàng TMCP Công Thương Việt Nam',
    shortName: 'VietinBank',
    groupType: 'BIG4',
    brandColor: '#004F9F', // Royal Blue
  },

  // 2. Commercial Joint-Stock Banks (TMCP)
  {
    id: 'b0000001-0000-0000-0000-000000000005',
    code: 'TCB',
    name: 'Ngân hàng TMCP Kỹ Thương Việt Nam',
    shortName: 'Techcombank',
    groupType: 'TMCP',
    brandColor: '#ED1C24', // Red
  },
  {
    id: 'b0000001-0000-0000-0000-000000000006',
    code: 'MBB',
    name: 'Ngân hàng TMCP Quân đội',
    shortName: 'MB Bank',
    groupType: 'TMCP',
    brandColor: '#183883', // Navy Blue
  },
  {
    id: 'b0000001-0000-0000-0000-000000000007',
    code: 'VPB',
    name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
    shortName: 'VPBank',
    groupType: 'TMCP',
    brandColor: '#00A859', // Vibrant Green
  },
  {
    id: 'b0000001-0000-0000-0000-000000000008',
    code: 'ACB',
    name: 'Ngân hàng TMCP Á Châu',
    shortName: 'ACB',
    groupType: 'TMCP',
    brandColor: '#00529C', // Ocean Blue
  },
  {
    id: 'b0000001-0000-0000-0000-000000000009',
    code: 'TPB',
    name: 'Ngân hàng TMCP Tiên Phong',
    shortName: 'TPBank',
    groupType: 'TMCP',
    brandColor: '#6F2C91', // Purple
  },
  {
    id: 'b0000001-0000-0000-0000-000000000010',
    code: 'MSB',
    name: 'Ngân hàng TMCP Hàng Hải Việt Nam',
    shortName: 'MSB',
    groupType: 'TMCP',
    brandColor: '#EA5A0B', // Orange
  },
  {
    id: 'b0000001-0000-0000-0000-000000000011',
    code: 'OCB',
    name: 'Ngân hàng TMCP Phương Đông',
    shortName: 'OCB',
    groupType: 'TMCP',
    brandColor: '#008853', // Deep Emerald
  },
  {
    id: 'b0000001-0000-0000-0000-000000000012',
    code: 'LPB',
    name: 'Ngân hàng TMCP Lộc Phát Việt Nam',
    shortName: 'LPBank',
    groupType: 'TMCP',
    brandColor: '#F37021', // Warm Orange
  },
  {
    id: 'b0000001-0000-0000-0000-000000000013',
    code: 'PGB',
    name: 'Ngân hàng TMCP Thịnh Vượng và Phát Triển',
    shortName: 'PGBank',
    groupType: 'TMCP',
    brandColor: '#009FDF', // Cyan Blue
  },

  // 3. Digital Bank
  {
    id: 'b0000001-0000-0000-0000-000000000014',
    code: 'CAKE',
    name: 'Ngân hàng số Cake by VPBank',
    shortName: 'Cake by VPBank',
    groupType: 'DIGITAL',
    brandColor: '#E90064', // Neon Magenta
  },
];

// Helper to generate full rate entries
const rateMap: Record<string, { online: Record<TermMonths, number>; counter: Record<TermMonths, number> }> = {
  VCB: {
    online: { 1: 1.7, 3: 2.0, 6: 3.1, 9: 3.1, 12: 4.7, 18: 4.8, 24: 4.8 },
    counter: { 1: 1.6, 3: 1.9, 6: 2.9, 9: 2.9, 12: 4.6, 18: 4.7, 24: 4.7 },
  },
  BIDV: {
    online: { 1: 1.8, 3: 2.1, 6: 3.2, 9: 3.2, 12: 4.8, 18: 4.9, 24: 4.9 },
    counter: { 1: 1.7, 3: 2.0, 6: 3.0, 9: 3.0, 12: 4.7, 18: 4.8, 24: 4.8 },
  },
  AGR: {
    online: { 1: 1.8, 3: 2.1, 6: 3.2, 9: 3.2, 12: 4.8, 18: 4.9, 24: 4.9 },
    counter: { 1: 1.7, 3: 2.0, 6: 3.0, 9: 3.0, 12: 4.7, 18: 4.7, 24: 4.8 },
  },
  CTG: {
    online: { 1: 1.9, 3: 2.2, 6: 3.2, 9: 3.2, 12: 4.8, 18: 4.9, 24: 5.0 },
    counter: { 1: 1.7, 3: 2.0, 6: 3.0, 9: 3.0, 12: 4.7, 18: 4.7, 24: 4.8 },
  },
  TCB: {
    online: { 1: 3.2, 3: 3.5, 6: 4.5, 9: 4.5, 12: 4.9, 18: 5.0, 24: 5.0 },
    counter: { 1: 3.0, 3: 3.3, 6: 4.3, 9: 4.3, 12: 4.7, 18: 4.8, 24: 4.8 },
  },
  MBB: {
    online: { 1: 3.5, 3: 3.9, 6: 4.5, 9: 4.6, 12: 5.1, 18: 5.3, 24: 5.7 },
    counter: { 1: 3.3, 3: 3.6, 6: 4.3, 9: 4.4, 12: 4.9, 18: 5.1, 24: 5.4 },
  },
  VPB: {
    online: { 1: 3.6, 3: 3.9, 6: 4.8, 9: 4.8, 12: 5.3, 18: 5.4, 24: 5.4 },
    counter: { 1: 3.4, 3: 3.7, 6: 4.6, 9: 4.6, 12: 5.1, 18: 5.2, 24: 5.2 },
  },
  ACB: {
    online: { 1: 3.2, 3: 3.6, 6: 4.3, 9: 4.4, 12: 4.9, 18: 5.0, 24: 5.0 },
    counter: { 1: 3.0, 3: 3.4, 6: 4.1, 9: 4.2, 12: 4.7, 18: 4.8, 24: 4.8 },
  },
  TPB: {
    online: { 1: 3.4, 3: 3.7, 6: 4.7, 9: 4.8, 12: 5.3, 18: 5.6, 24: 5.7 },
    counter: { 1: 3.2, 3: 3.5, 6: 4.5, 9: 4.6, 12: 5.1, 18: 5.4, 24: 5.5 },
  },
  MSB: {
    online: { 1: 3.5, 3: 3.8, 6: 4.6, 9: 4.7, 12: 5.2, 18: 5.4, 24: 5.4 },
    counter: { 1: 3.3, 3: 3.6, 6: 4.4, 9: 4.5, 12: 5.0, 18: 5.2, 24: 5.2 },
  },
  OCB: {
    online: { 1: 3.7, 3: 3.9, 6: 4.9, 9: 5.0, 12: 5.4, 18: 5.7, 24: 5.8 },
    counter: { 1: 3.5, 3: 3.7, 6: 4.7, 9: 4.8, 12: 5.2, 18: 5.5, 24: 5.6 },
  },
  LPB: {
    online: { 1: 3.6, 3: 3.9, 6: 4.8, 9: 4.9, 12: 5.4, 18: 5.6, 24: 5.6 },
    counter: { 1: 3.4, 3: 3.7, 6: 4.6, 9: 4.7, 12: 5.2, 18: 5.4, 24: 5.4 },
  },
  PGB: {
    online: { 1: 3.6, 3: 4.0, 6: 5.0, 9: 5.1, 12: 5.6, 18: 5.7, 24: 5.8 },
    counter: { 1: 3.4, 3: 3.8, 6: 4.8, 9: 4.9, 12: 5.4, 18: 5.5, 24: 5.6 },
  },
  CAKE: {
    online: { 1: 3.9, 3: 4.2, 6: 5.2, 9: 5.3, 12: 5.8, 18: 6.0, 24: 6.0 },
    counter: { 1: 3.9, 3: 4.2, 6: 5.2, 9: 5.3, 12: 5.8, 18: 6.0, 24: 6.0 },
  },
};

const terms: TermMonths[] = [1, 3, 6, 9, 12, 18, 24];

export const MOCK_DEPOSIT_RATES: DepositRate[] = MOCK_BANKS.flatMap((bank, bankIdx) => {
  const bankRates = rateMap[bank.code] || {
    online: { 1: 3.0, 3: 3.4, 6: 4.5, 9: 4.6, 12: 5.0, 18: 5.2, 24: 5.3 },
    counter: { 1: 2.8, 3: 3.2, 6: 4.3, 9: 4.4, 12: 4.8, 18: 5.0, 24: 5.1 },
  };

  const onlineEntries: DepositRate[] = terms.map((term, tIdx) => ({
    id: `rate-${bank.code}-online-${term}`,
    bankId: bank.id,
    depositType: 'ONLINE',
    termMonths: term,
    ratePercent: bankRates.online[term],
    updatedAt: '2025-01-15T08:00:00Z',
  }));

  const counterEntries: DepositRate[] = terms.map((term, tIdx) => ({
    id: `rate-${bank.code}-counter-${term}`,
    bankId: bank.id,
    depositType: 'COUNTER',
    termMonths: term,
    ratePercent: bankRates.counter[term],
    updatedAt: '2025-01-15T08:00:00Z',
  }));

  return [...onlineEntries, ...counterEntries];
});

/**
 * Filter and retrieve rates by term, channel, and bank group
 */
export function getRatesForParams(
  termMonths: TermMonths,
  depositType: DepositType,
  groupFilter: BankGroup = 'ALL'
): { bank: Bank; ratePercent: number }[] {
  const filteredBanks = groupFilter === 'ALL' 
    ? MOCK_BANKS 
    : MOCK_BANKS.filter(b => b.groupType === groupFilter);

  return filteredBanks.map(bank => {
    const rateEntry = MOCK_DEPOSIT_RATES.find(
      r => r.bankId === bank.id && r.depositType === depositType && r.termMonths === termMonths
    );
    return {
      bank,
      ratePercent: rateEntry ? rateEntry.ratePercent : 0,
    };
  });
}
