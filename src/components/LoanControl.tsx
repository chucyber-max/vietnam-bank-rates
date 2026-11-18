'use client';

import React, { useState, useEffect } from 'react';
import {
  BankGroup,
  LoanCategory,
  LoanCalculatorState,
} from '@/types';
import { formatVND, formatVNDNumberOnly, parseVND } from '@/lib/formatters';
import { numberToVietnameseWords } from '@/lib/numberToVietnameseWords';
import {
  Home,
  Car,
  CreditCard,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface LoanControlProps {
  state: LoanCalculatorState;
  onChange: (newState: Partial<LoanCalculatorState>) => void;
}

const CATEGORIES: { key: LoanCategory; label: string; icon: any; desc: string }[] = [
  {
    key: 'MORTGAGE',
    label: 'Vay mua nhà / Thế chấp',
    icon: Home,
    desc: 'Bất động sản, xây sửa nhà',
  },
  {
    key: 'AUTO',
    label: 'Vay mua ô tô',
    icon: Car,
    desc: 'Xe mới & xe đã qua sử dụng',
  },
  {
    key: 'UNSECURED',
    label: 'Vay tín chấp tiêu dùng',
    icon: CreditCard,
    desc: 'Không cần thế chấp tài sản',
  },
];

interface AmountConfig {
  min: number;
  max: number;
  step: number;
  defaultAmount: number;
  chips: { label: string; value: number }[];
  helperNote: string;
}

const AMOUNT_CONFIGS: Record<LoanCategory, AmountConfig> = {
  UNSECURED: {
    min: 5_000_000,
    max: 500_000_000,
    step: 5_000_000,
    defaultAmount: 30_000_000,
    chips: [
      { label: '10 triệu', value: 10_000_000 },
      { label: '20 triệu', value: 20_000_000 },
      { label: '50 triệu', value: 50_000_000 },
      { label: '100 triệu', value: 100_000_000 },
      { label: '300 triệu', value: 300_000_000 },
    ],
    helperNote: 'Hạn mức vay tín chấp phổ biến tại các ngân hàng: 10 – 500 triệu đồng',
  },
  AUTO: {
    min: 100_000_000,
    max: 2_000_000_000,
    step: 20_000_000,
    defaultAmount: 400_000_000,
    chips: [
      { label: '200 triệu', value: 200_000_000 },
      { label: '400 triệu', value: 400_000_000 },
      { label: '600 triệu', value: 600_000_000 },
      { label: '1 tỷ', value: 1_000_000_000 },
      { label: '1,5 tỷ', value: 1_500_000_000 },
    ],
    helperNote: 'Hạn mức vay mua ô tô thông thường: 100 triệu – 2 tỷ đồng (tối đa 70–80% giá trị xe)',
  },
  MORTGAGE: {
    min: 200_000_000,
    max: 5_000_000_000,
    step: 50_000_000,
    defaultAmount: 1_000_000_000,
    chips: [
      { label: '500 triệu', value: 500_000_000 },
      { label: '1 tỷ', value: 1_000_000_000 },
      { label: '1,5 tỷ', value: 1_500_000_000 },
      { label: '2 tỷ', value: 2_000_000_000 },
      { label: '3 tỷ', value: 3_000_000_000 },
    ],
    helperNote: 'Hạn mức vay thế chấp BĐS phổ biến: 200 triệu – 5 tỷ đồng',
  },
};

interface TermConfig {
  min: number;
  max: number;
  step: number;
  defaultTerm: number;
  pills: { months: number; label: string }[];
  helperNote: string;
}

const TERM_CONFIGS: Record<LoanCategory, TermConfig> = {
  UNSECURED: {
    min: 6,
    max: 60,
    step: 1,
    defaultTerm: 12,
    pills: [
      { months: 6, label: '6 tháng' },
      { months: 12, label: '12 tháng' },
      { months: 18, label: '18 tháng' },
      { months: 24, label: '24 tháng' },
      { months: 36, label: '36 tháng' },
      { months: 48, label: '48 tháng' },
      { months: 60, label: '60 tháng' },
    ],
    helperNote: 'Thời hạn vay tín chấp tối đa tại các ngân hàng thường là 5 năm (60 tháng)',
  },
  AUTO: {
    min: 12,
    max: 240,
    step: 1,
    defaultTerm: 60,
    pills: [
      { months: 12, label: '12 tháng (1 năm)' },
      { months: 36, label: '36 tháng (3 năm)' },
      { months: 60, label: '60 tháng (5 năm)' },
      { months: 120, label: '120 tháng (10 năm)' },
      { months: 180, label: '180 tháng (15 năm)' },
      { months: 240, label: '240 tháng (20 năm)' },
    ],
    helperNote: 'Thời hạn vay mua ô tô phổ biến từ 3 – 8 năm (tối đa tới 10–20 năm tùy chính sách ngân hàng)',
  },
  MORTGAGE: {
    min: 12,
    max: 240,
    step: 1,
    defaultTerm: 60,
    pills: [
      { months: 12, label: '12 tháng (1 năm)' },
      { months: 36, label: '36 tháng (3 năm)' },
      { months: 60, label: '60 tháng (5 năm)' },
      { months: 120, label: '120 tháng (10 năm)' },
      { months: 180, label: '180 tháng (15 năm)' },
      { months: 240, label: '240 tháng (20 năm)' },
    ],
    helperNote: 'Thời hạn vay mua nhà / thế chấp BĐS lên đến 20 năm (240 tháng)',
  },
};

const BANK_GROUPS: { key: BankGroup; label: string; badge: string }[] = [
  { key: 'ALL', label: 'Tất cả', badge: '14' },
  { key: 'BIG4', label: 'Big4 Nhà nước', badge: '4' },
  { key: 'TMCP', label: 'Ngân hàng TMCP', badge: '9' },
  { key: 'DIGITAL', label: 'Ngân hàng số', badge: '1' },
];

function formatMonthsAndYears(months: number): string {
  if (months < 12) {
    return `${months} tháng`;
  }
  const years = months / 12;
  const formattedYears = Number.isInteger(years) ? `${years}` : `${years.toFixed(1).replace('.', ',')}`;
  return `${months} tháng (${formattedYears} năm)`;
}

export const LoanControl: React.FC<LoanControlProps> = ({ state, onChange }) => {
  const currentAmountConfig = AMOUNT_CONFIGS[state.category];
  const currentTermConfig = TERM_CONFIGS[state.category];

  const [inputAmountText, setInputAmountText] = useState<string>(
    formatVNDNumberOnly(state.amount)
  );

  const [inputTermNumber, setInputTermNumber] = useState<number>(state.termMonths);

  // Keep amount input in sync with external state changes
  useEffect(() => {
    setInputAmountText(formatVNDNumberOnly(state.amount));
  }, [state.amount]);

  // Keep term input in sync with external state changes
  useEffect(() => {
    setInputTermNumber(state.termMonths);
  }, [state.termMonths]);

  // Handle switching category
  const handleCategoryChange = (newCat: LoanCategory) => {
    const targetAmountConfig = AMOUNT_CONFIGS[newCat];
    const targetTermConfig = TERM_CONFIGS[newCat];

    let newAmount = state.amount;
    if (newAmount < targetAmountConfig.min || newAmount > targetAmountConfig.max) {
      newAmount = targetAmountConfig.defaultAmount;
    }

    let newTerm = state.termMonths;
    if (newTerm < targetTermConfig.min || newTerm > targetTermConfig.max) {
      newTerm = targetTermConfig.defaultTerm;
    }

    setInputAmountText(formatVNDNumberOnly(newAmount));
    setInputTermNumber(newTerm);

    onChange({
      category: newCat,
      amount: newAmount,
      termMonths: newTerm,
    });
  };

  // Amount Handlers
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseVND(rawVal);
    setInputAmountText(rawVal ? formatVNDNumberOnly(parsed) : '');
    if (parsed > 0) {
      onChange({ amount: parsed });
    }
  };

  const handleAmountBlur = () => {
    let clean = parseVND(inputAmountText);
    if (clean < currentAmountConfig.min) clean = currentAmountConfig.min;
    if (clean > currentAmountConfig.max) clean = currentAmountConfig.max;
    setInputAmountText(formatVNDNumberOnly(clean));
    onChange({ amount: clean });
  };

  const handleAmountChipClick = (val: number) => {
    setInputAmountText(formatVNDNumberOnly(val));
    onChange({ amount: val });
  };

  const handleAmountSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInputAmountText(formatVNDNumberOnly(val));
    onChange({ amount: val });
  };

  // Term Handlers (Months)
  const handleTermSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInputTermNumber(val);
    onChange({ termMonths: val });
  };

  const handleTermInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseInt(e.target.value, 10);
    if (!isNaN(rawVal)) {
      setInputTermNumber(rawVal);
      if (rawVal >= currentTermConfig.min && rawVal <= currentTermConfig.max) {
        onChange({ termMonths: rawVal });
      }
    } else {
      setInputTermNumber(currentTermConfig.min);
    }
  };

  const handleTermInputBlur = () => {
    let val = inputTermNumber;
    if (isNaN(val) || val < currentTermConfig.min) val = currentTermConfig.min;
    if (val > currentTermConfig.max) val = currentTermConfig.max;
    setInputTermNumber(val);
    onChange({ termMonths: val });
  };

  const handleTermPillClick = (months: number) => {
    setInputTermNumber(months);
    onChange({ termMonths: months });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-fintech border border-slate-200/80 space-y-6">
      {/* 1. Loan Category Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Gói mục đích vay vốn
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CATEGORIES.map(({ key, label, icon: Icon, desc }) => {
            const isSelected = state.category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/30 text-blue-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{label}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Loan Amount Input + Quick Chips + Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Số tiền cần vay
          </label>
          <span className="text-xs text-slate-500 italic truncate max-w-[200px] sm:max-w-xs text-right">
            {numberToVietnameseWords(state.amount)}
          </span>
        </div>

        {/* Currency Input Box */}
        <div className="relative rounded-2xl border-2 border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all bg-slate-50/50">
          <input
            type="text"
            value={inputAmountText}
            onChange={handleAmountInputChange}
            onBlur={handleAmountBlur}
            className="w-full pl-5 pr-14 py-3.5 bg-transparent text-2xl font-bold text-slate-900 outline-none tabular-nums"
            placeholder="0"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-lg font-bold text-slate-400">₫</span>
          </div>
        </div>

        {/* Dynamic Range Slider */}
        <div className="mt-4 px-1">
          <input
            type="range"
            min={currentAmountConfig.min}
            max={currentAmountConfig.max}
            step={currentAmountConfig.step}
            value={state.amount}
            onChange={handleAmountSliderChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
            <span>{formatVND(currentAmountConfig.min)}</span>
            <span>{formatVND((currentAmountConfig.min + currentAmountConfig.max) / 2)}</span>
            <span>{formatVND(currentAmountConfig.max)}</span>
          </div>
        </div>

        {/* Dynamic Quick Chips */}
        <div className="flex flex-wrap gap-2 mt-3.5">
          {currentAmountConfig.chips.map(item => {
            const isSelected = state.amount === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAmountChipClick(item.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Helper Note for Amount */}
        <div className="text-[11px] text-slate-500 mt-2.5 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>{currentAmountConfig.helperNote}</span>
        </div>
      </div>

      {/* 3. Interactive Month-Based Loan Duration (Slider + Synchronized Input + Quick Pills) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Thời hạn vay (Kỳ hạn trả góp)</span>
          </label>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
            {formatMonthsAndYears(state.termMonths)}
          </span>
        </div>

        {/* Draggable Month Range Slider & Synchronized Numeric Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1 px-1">
            <input
              type="range"
              min={currentTermConfig.min}
              max={currentTermConfig.max}
              step={currentTermConfig.step}
              value={state.termMonths}
              onChange={handleTermSliderChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>{currentTermConfig.min} tháng</span>
              <span>{Math.round((currentTermConfig.min + currentTermConfig.max) / 2)} tháng</span>
              <span>{currentTermConfig.max} tháng</span>
            </div>
          </div>

          {/* Synchronized Exact Month Input */}
          <div className="w-24 shrink-0 relative">
            <input
              type="number"
              min={currentTermConfig.min}
              max={currentTermConfig.max}
              value={inputTermNumber}
              onChange={handleTermInputChange}
              onBlur={handleTermInputBlur}
              className="w-full pl-3 pr-8 py-2 text-center text-sm font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none tabular-nums transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
              tháng
            </span>
          </div>
        </div>

        {/* Dynamic Quick-Select Pills */}
        <div className="flex flex-wrap gap-2 mt-3.5">
          {currentTermConfig.pills.map(({ months, label }) => {
            const isSelected = state.termMonths === months;
            return (
              <button
                key={months}
                type="button"
                onClick={() => handleTermPillClick(months)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Helper Note for Duration */}
        <div className="text-[11px] text-slate-500 mt-2.5 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>{currentTermConfig.helperNote}</span>
        </div>
      </div>

      {/* 4. Calculation Method Filter */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Phương thức tính lãi & trả nợ
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChange({ method: 'PACKAGE' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              state.method === 'PACKAGE'
                ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-1 ring-blue-600 font-bold'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="text-xs font-bold mb-0.5">Theo gói ngân hàng</div>
            <div className="text-[10px] text-slate-500">Ưu đãi rồi thả nổi (Chuẩn thị trường)</div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ method: 'REDUCING_BALANCE' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              state.method === 'REDUCING_BALANCE'
                ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-1 ring-blue-600 font-bold'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="text-xs font-bold mb-0.5">Dư nợ giảm dần</div>
            <div className="text-[10px] text-slate-500">Gốc chia đều, lãi giảm dần theo dư nợ</div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ method: 'ANNUITY' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              state.method === 'ANNUITY'
                ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-1 ring-blue-600 font-bold'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="text-xs font-bold mb-0.5">Trả góp đều (Annuity)</div>
            <div className="text-[10px] text-slate-500">Số tiền gốc + lãi cố định mỗi tháng</div>
          </button>
        </div>
      </div>

      {/* 5. Bank Group Filter & Sort */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Lọc nhóm ngân hàng
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BANK_GROUPS.map(({ key, label, badge }) => {
              const isSelected = state.groupFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ groupFilter: key })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] px-1 py-0.1 rounded-full font-bold ${
                      isSelected ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Thứ tự ưu tiên
          </label>
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => onChange({ sortOrder: 'asc' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                state.sortOrder === 'asc'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lãi thấp nhất
            </button>
            <button
              type="button"
              onClick={() => onChange({ sortOrder: 'desc' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                state.sortOrder === 'desc'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lãi cao nhất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
