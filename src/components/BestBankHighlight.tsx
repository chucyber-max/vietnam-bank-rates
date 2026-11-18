'use client';

import React from 'react';
import { CalculationResult, SavingsMode, TermMonths } from '@/types';
import { formatVND, formatPercent, formatDiffVND } from '@/lib/formatters';
import {
  Crown,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Banknote,
  PiggyBank,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BestBankHighlightProps {
  topBank: CalculationResult | null;
  mode: SavingsMode;
  termMonths: TermMonths;
  onOpenCompare: (bankId: string) => void;
}

export const BestBankHighlight: React.FC<BestBankHighlightProps> = ({
  topBank,
  mode,
  termMonths,
  onOpenCompare,
}) => {
  if (!topBank) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
        Không tìm thấy ngân hàng phù hợp với bộ lọc hiện tại.
      </div>
    );
  }

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // safe fallback
    }
    onOpenCompare(topBank.bank.id);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 text-white p-6 sm:p-7 shadow-fintech-lg border border-emerald-500/40">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Lãi suất cao nhất #1 thị trường</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Kỳ hạn: <strong className="text-white">{termMonths} tháng</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">
            {mode === 'MONTHLY' ? 'Gửi tích lũy hàng tháng' : 'Gửi một lần'}
          </span>
        </div>
      </div>

      {/* Main Bank Presentation */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
        <div className="flex items-center gap-4">
          {/* Avatar Monogram */}
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg ring-4 ring-white/10 shrink-0"
            style={{
              backgroundColor: topBank.bank.brandColor || '#059669',
              color: '#ffffff',
            }}
          >
            {topBank.bank.code}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {topBank.bank.shortName}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                {topBank.bank.groupType}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 max-w-sm">
              {topBank.bank.name}
            </p>
          </div>
        </div>

        {/* Rate Highlight Pill */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-3.5 flex items-center justify-between md:justify-end gap-4 shrink-0">
          <div>
            <div className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">
              Lãi suất niêm yết
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 tabular-nums">
              {formatPercent(topBank.ratePercent)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        {/* Metric 1: Total Principal */}
        <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/70">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <PiggyBank className="w-3.5 h-3.5 text-slate-400" />
            <span>Tổng tiền gốc nạp</span>
          </div>
          <div className="text-xl font-bold text-slate-200 tabular-nums">
            {formatVND(topBank.totalPrincipal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {mode === 'MONTHLY' ? `${termMonths} lần gửi đều đặn` : 'Vốn đầu tư ban đầu'}
          </div>
        </div>

        {/* Metric 2: Total Interest (Bold Emerald) */}
        <div className="bg-emerald-950/40 rounded-2xl p-4 border border-emerald-500/40 relative">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Tiền lãi nhận được</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums">
            {formatVND(topBank.totalInterest)}
          </div>
          {topBank.differenceFromLowest > 0 && (
            <div className="text-[11px] font-semibold text-emerald-300 mt-1">
              {formatDiffVND(topBank.differenceFromLowest)} so với thấp nhất
            </div>
          )}
        </div>

        {/* Metric 3: Grand Total Received */}
        <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/70">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Tổng thực nhận cuối kỳ</span>
          </div>
          <div className="text-xl font-bold text-white tabular-nums">
            {formatVND(topBank.totalReceived)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Bao gồm toàn bộ gốc + lãi
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-400">
          * Tiền lãi được tính theo chuẩn ngày thực tế/365 của Ngân hàng Nhà nước.
        </div>
        <button
          type="button"
          onClick={triggerCelebration}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <span>Xem phân tích chi tiết ngân hàng này</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
