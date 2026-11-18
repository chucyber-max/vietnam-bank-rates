'use client';

import React from 'react';
import { LoanCalculationResult, LoanCategory } from '@/types';
import { formatVND, formatPercent, formatDiffVND } from '@/lib/formatters';
import {
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Banknote,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface LoanHeroHighlightProps {
  lowestBank: LoanCalculationResult | null;
  highestBank: LoanCalculationResult | null;
  category: LoanCategory;
  termMonths: number;
  onOpenSchedule: (bankResult: LoanCalculationResult) => void;
}

export const LoanHeroHighlight: React.FC<LoanHeroHighlightProps> = ({
  lowestBank,
  highestBank,
  category,
  termMonths,
  onOpenSchedule,
}) => {
  if (!lowestBank || !highestBank) {
    return null;
  }

  const costDifference = Math.max(0, highestBank.totalInterest - lowestBank.totalInterest);
  const percentSaved = highestBank.totalInterest > 0
    ? ((costDifference / highestBank.totalInterest) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Best Loan Deal: Lowest Interest Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white p-6 shadow-fintech-lg border border-emerald-500/40 flex flex-col justify-between">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Banner */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gói vay tối ưu #1 • Lãi thấp nhất</span>
            </span>

            <span className="text-xs text-slate-400">
              Kỳ hạn: <strong className="text-white">{termMonths / 12} năm ({termMonths}T)</strong>
            </span>
          </div>

          {/* Bank Profile & Rates */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md shrink-0"
                style={{ backgroundColor: lowestBank.bank.brandColor || '#059669' }}
              >
                {lowestBank.bank.code}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{lowestBank.bank.shortName}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-semibold text-slate-300">
                  {lowestBank.bank.groupType}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-emerald-400 uppercase font-bold">Lãi suất ưu đãi</div>
              <div className="text-2xl font-black text-emerald-400 tabular-nums">
                {formatPercent(lowestBank.promoRate)}
              </div>
              <div className="text-[10px] text-slate-400">
                Sau ưu đãi: {formatPercent(lowestBank.floatingRate)}
              </div>
            </div>
          </div>

          {/* Key Payment Figures */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70">
              <span className="text-[11px] text-slate-400 block">Trả tháng đầu</span>
              <div className="text-base font-bold text-slate-100 tabular-nums mt-0.5">
                {formatVND(lowestBank.firstMonthPayment)}
              </div>
              <span className="text-[10px] text-slate-500">Đã gồm gốc + lãi</span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70">
              <span className="text-[11px] text-slate-400 block">Tháng cao nhất</span>
              <div className="text-base font-bold text-slate-100 tabular-nums mt-0.5">
                {formatVND(lowestBank.maxMonthlyPayment)}
              </div>
              <span className="text-[10px] text-slate-500">Giai đoạn thả nổi</span>
            </div>
          </div>

          {/* Grand Interest Highlight */}
          <div className="p-3.5 bg-emerald-950/50 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300 font-semibold block">Tổng lãi phải trả suốt kỳ</span>
              <div className="text-xl font-black text-emerald-400 tabular-nums">
                {formatVND(lowestBank.totalInterest)}
              </div>
            </div>

            {costDifference > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shadow-sm">
                Tiết kiệm {formatVND(costDifference)} (-{percentSaved}%)
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Phí trả trước hạn: {lowestBank.loanRate.earlyFeePercent}%</span>
          <button
            type="button"
            onClick={() => onOpenSchedule(lowestBank)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all active:scale-95 shadow-sm"
          >
            <span>Lịch trả chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Highest Cost Card: Highest Interest Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-900 text-white p-6 shadow-fintech-lg border border-rose-500/30 flex flex-col justify-between">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Banner */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Gói vay chi phí cao nhất</span>
            </span>

            <span className="text-xs text-rose-300">
              Đắt hơn: <strong className="text-rose-200">+{formatVND(costDifference)}</strong>
            </span>
          </div>

          {/* Bank Profile & Rates */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md shrink-0"
                style={{ backgroundColor: highestBank.bank.brandColor || '#991b1b' }}
              >
                {highestBank.bank.code}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{highestBank.bank.shortName}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-semibold text-slate-300">
                  {highestBank.bank.groupType}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-rose-400 uppercase font-bold">Lãi suất thả nổi</div>
              <div className="text-2xl font-black text-rose-400 tabular-nums">
                {formatPercent(highestBank.floatingRate)}
              </div>
              <div className="text-[10px] text-slate-400">
                Ưu đãi: {formatPercent(highestBank.promoRate)}
              </div>
            </div>
          </div>

          {/* Key Payment Figures */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70">
              <span className="text-[11px] text-slate-400 block">Trả tháng đầu</span>
              <div className="text-base font-bold text-slate-200 tabular-nums mt-0.5">
                {formatVND(highestBank.firstMonthPayment)}
              </div>
              <span className="text-[10px] text-slate-500">Đã gồm gốc + lãi</span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70">
              <span className="text-[11px] text-slate-400 block">Tháng cao nhất</span>
              <div className="text-base font-bold text-rose-300 tabular-nums mt-0.5">
                {formatVND(highestBank.maxMonthlyPayment)}
              </div>
              <span className="text-[10px] text-rose-400">Cao hơn {formatVND(highestBank.maxMonthlyPayment - lowestBank.maxMonthlyPayment)}</span>
            </div>
          </div>

          {/* Grand Interest Callout */}
          <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-300 font-semibold block">Tổng lãi phải trả suốt kỳ</span>
              <div className="text-xl font-black text-rose-400 tabular-nums">
                {formatVND(highestBank.totalInterest)}
              </div>
            </div>

            <span className="text-xs text-rose-300 text-right leading-tight max-w-[130px]">
              Gánh nặng lãi thêm <strong>+{percentSaved}%</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Phí trả trước hạn: {highestBank.loanRate.earlyFeePercent}%</span>
          <button
            type="button"
            onClick={() => onOpenSchedule(highestBank)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all active:scale-95 border border-slate-700"
          >
            <span>Xem đối chiếu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
