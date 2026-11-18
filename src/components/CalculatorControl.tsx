'use client';

import React, { useState } from 'react';
import {
  BankGroup,
  DepositType,
  SavingsCalculatorState,
  SavingsMode,
  TermMonths,
} from '@/types';
import { formatVND, formatVNDNumberOnly, parseVND } from '@/lib/formatters';
import { numberToVietnameseWords } from '@/lib/numberToVietnameseWords';
import {
  Calendar,
  Coins,
  Repeat,
  Sparkles,
  Smartphone,
  Building2,
  Layers,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CalculatorControlProps {
  state: SavingsCalculatorState;
  onChange: (newState: Partial<SavingsCalculatorState>) => void;
  onOpenEarlyWithdrawal: () => void;
}

const MONTHLY_PRESETS = [
  { label: '1 triệu', value: 1_000_000 },
  { label: '3 triệu', value: 3_000_000 },
  { label: '5 triệu', value: 5_000_000 },
  { label: '10 triệu', value: 10_000_000 },
  { label: '20 triệu', value: 20_000_000 },
];

const LUMP_SUM_PRESETS = [
  { label: '50 triệu', value: 50_000_000 },
  { label: '100 triệu', value: 100_000_000 },
  { label: '300 triệu', value: 300_000_000 },
  { label: '500 triệu', value: 500_000_000 },
  { label: '1 tỷ', value: 1_000_000_000 },
];

const TERMS: { months: TermMonths; label: string }[] = [
  { months: 1, label: '1 tháng' },
  { months: 3, label: '3 tháng' },
  { months: 6, label: '6 tháng' },
  { months: 9, label: '9 tháng' },
  { months: 12, label: '12 tháng' },
  { months: 18, label: '18 tháng' },
  { months: 24, label: '24 tháng' },
];

const BANK_GROUPS: { key: BankGroup; label: string; badge: string }[] = [
  { key: 'ALL', label: 'Tất cả', badge: '14' },
  { key: 'BIG4', label: 'Big4 Nhà nước', badge: '4' },
  { key: 'TMCP', label: 'Ngân hàng TMCP', badge: '9' },
  { key: 'DIGITAL', label: 'Ngân hàng số', badge: '1' },
];

export const CalculatorControl: React.FC<CalculatorControlProps> = ({
  state,
  onChange,
  onOpenEarlyWithdrawal,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    formatVNDNumberOnly(state.amount)
  );

  const isMonthly = state.mode === 'MONTHLY';
  const presets = isMonthly ? MONTHLY_PRESETS : LUMP_SUM_PRESETS;
  const minAmount = isMonthly ? 500_000 : 5_000_000;
  const maxAmount = isMonthly ? 100_000_000 : 3_000_000_000;
  const stepAmount = isMonthly ? 500_000 : 5_000_000;

  const handleModeChange = (newMode: SavingsMode) => {
    const defaultAmount = newMode === 'MONTHLY' ? 3_000_000 : 100_000_000;
    setInputValue(formatVNDNumberOnly(defaultAmount));
    onChange({
      mode: newMode,
      amount: defaultAmount,
    });
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseVND(rawVal);
    setInputValue(rawVal ? formatVNDNumberOnly(parsed) : '');
    if (parsed > 0) {
      onChange({ amount: parsed });
    }
  };

  const handleAmountBlur = () => {
    let clean = parseVND(inputValue);
    if (clean < minAmount) clean = minAmount;
    if (clean > maxAmount) clean = maxAmount;
    setInputValue(formatVNDNumberOnly(clean));
    onChange({ amount: clean });
  };

  const handlePresetClick = (val: number) => {
    setInputValue(formatVNDNumberOnly(val));
    onChange({ amount: val });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInputValue(formatVNDNumberOnly(val));
    onChange({ amount: val });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-fintech border border-slate-200/80 space-y-6">
      {/* 1. Mode Switcher Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Phương thức tiết kiệm
        </label>
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/70">
          <button
            type="button"
            onClick={() => handleModeChange('MONTHLY')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              isMonthly
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className={`w-4 h-4 ${isMonthly ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Gửi tích lũy hàng tháng</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('LUMP_SUM')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              !isMonthly
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className={`w-4 h-4 ${!isMonthly ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Gửi một lần (Có kỳ hạn)</span>
          </button>
        </div>
      </div>

      {/* 2. Amount Input + Quick Chips + Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isMonthly ? 'Số tiền gửi đều mỗi tháng' : 'Số tiền gốc gửi một lần'}
          </label>
          <span className="text-xs text-slate-500 italic truncate max-w-[200px] sm:max-w-xs text-right">
            {numberToVietnameseWords(state.amount)}
          </span>
        </div>

        {/* Currency Input Box */}
        <div className="relative rounded-2xl border-2 border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 transition-all bg-slate-50/50">
          <input
            type="text"
            value={inputValue}
            onChange={handleAmountInputChange}
            onBlur={handleAmountBlur}
            className="w-full pl-5 pr-14 py-3.5 bg-transparent text-2xl font-bold text-slate-900 outline-none tabular-nums"
            placeholder="0"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-lg font-bold text-slate-400">₫</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="mt-4 px-1">
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step={stepAmount}
            value={state.amount}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
            <span>{formatVND(minAmount)}</span>
            <span>{formatVND(maxAmount / 2)}</span>
            <span>{formatVND(maxAmount)}</span>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="flex flex-wrap gap-2 mt-3.5">
          {presets.map(item => {
            const isSelected = state.amount === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handlePresetClick(item.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Term Selector Pills */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Kỳ hạn gửi tiết kiệm
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {TERMS.map(({ months, label }) => {
            const isSelected = state.termMonths === months;
            return (
              <button
                key={months}
                type="button"
                onClick={() => onChange({ termMonths: months })}
                className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600 ring-offset-1'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Deposit Channel (Online vs Counter) */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Kênh gửi tiền
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ depositType: 'ONLINE' })}
            className={`relative flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
              state.depositType === 'ONLINE'
                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-500'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className={`w-5 h-5 ${state.depositType === 'ONLINE' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-sm font-bold">Gửi Online</div>
                <div className="text-[11px] text-slate-500">Ứng dụng / Internet Banking</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
              Lãi cao hơn
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ depositType: 'COUNTER' })}
            className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-left transition-all ${
              state.depositType === 'COUNTER'
                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-500'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <Building2 className={`w-5 h-5 ${state.depositType === 'COUNTER' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div>
              <div className="text-sm font-bold">Gửi tại quầy</div>
              <div className="text-[11px] text-slate-500">Trực tiếp phòng giao dịch</div>
            </div>
          </button>
        </div>
      </div>

      {/* 5. Bank Group Filter */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Lọc nhóm ngân hàng
        </label>
        <div className="flex flex-wrap gap-2">
          {BANK_GROUPS.map(({ key, label, badge }) => {
            const isSelected = state.groupFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ groupFilter: key })}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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

      {/* Lump-Sum Optional: Compound Rollover Toggle */}
      {!isMonthly && (
        <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-sm font-bold text-emerald-900">
                  Tự động tái tục gốc & lãi (Lãi kép)
                </span>
                <p className="text-xs text-emerald-700">
                  Đáo hạn tự động gộp lãi vào vốn cho kỳ tiếp theo
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.enableCompound}
                onChange={e => onChange({ enableCompound: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {state.enableCompound && (
            <div className="pt-2 border-t border-emerald-200/50 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-emerald-900">Số chu kỳ tái tục:</span>
              <div className="flex gap-1.5">
                {[2, 3, 5, 10].map(cycles => (
                  <button
                    key={cycles}
                    type="button"
                    onClick={() => onChange({ compoundCycles: cycles })}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                      state.compoundCycles === cycles
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {cycles} kỳ ({cycles * state.termMonths} tháng)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Early Withdrawal Warning Trigger Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenEarlyWithdrawal}
          className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-2xl transition-all text-xs font-semibold group"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Dự toán thiệt hại nếu RÚT TIẾT KIỆM TRƯỚC HẠN</span>
          </div>
          <span className="text-amber-700 underline group-hover:text-amber-900">
            Xem tính toán chi tiết →
          </span>
        </button>
      </div>
    </div>
  );
};
