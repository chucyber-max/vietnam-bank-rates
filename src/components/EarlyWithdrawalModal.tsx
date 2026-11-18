'use client';

import React, { useState } from 'react';
import { CalculationResult, TermMonths } from '@/types';
import { calculateEarlyWithdrawal } from '@/lib/interestCalculator';
import { formatVND, formatPercent } from '@/lib/formatters';
import {
  AlertTriangle,
  X,
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
  Percent,
} from 'lucide-react';

interface EarlyWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  principal: number;
  termMonths: TermMonths;
  topBank: CalculationResult | null;
}

export const EarlyWithdrawalModal: React.FC<EarlyWithdrawalModalProps> = ({
  isOpen,
  onClose,
  principal,
  termMonths,
  topBank,
}) => {
  const totalDays = termMonths * 30; // standard 30 days/month
  const [daysHeld, setDaysHeld] = useState<number>(Math.max(15, Math.round(totalDays * 0.5)));
  const [nonTermRate, setNonTermRate] = useState<number>(0.2); // 0.2% / year default

  if (!isOpen || !topBank) return null;

  const result = calculateEarlyWithdrawal(
    principal,
    termMonths,
    topBank.ratePercent,
    daysHeld,
    nonTermRate
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-amber-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-amber-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Dự toán thiệt hại khi Rút tiết kiệm trước hạn
              </h3>
              <p className="text-xs text-amber-800">
                Mô phỏng theo Thông tư 04/2022/TT-NHNN của Ngân hàng Nhà nước
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Regulatory Warning Banner */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Quy định pháp lý quan trọng:</strong> Khi người gửi tiền rút toàn bộ hoặc một phần tiền gửi trước hạn, phần tiền rút sớm sẽ chỉ được hưởng <strong>lãi suất không kỳ hạn</strong> (thường dao động từ 0,1% đến 0,5%/năm), mất đi toàn bộ quyền lợi lãi suất có kỳ hạn thỏa thuận ban đầu.
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-4">
            {/* Days Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">Thời gian đã gửi trước khi rút sớm:</span>
                <span className="text-amber-700 font-extrabold text-sm">
                  {daysHeld} ngày (~{Math.round(daysHeld / 30)} tháng) / {totalDays} ngày kỳ hạn
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={Math.max(10, totalDays - 1)}
                step={5}
                value={daysHeld}
                onChange={e => setDaysHeld(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Rút ngay sau 5 ngày</span>
                <span>Rút sát ngày đáo hạn ({totalDays - 1} ngày)</span>
              </div>
            </div>

            {/* Non-term rate preset selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Mức lãi suất không kỳ hạn áp dụng:
              </label>
              <div className="flex gap-2">
                {[0.1, 0.2, 0.3, 0.5].map(rate => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setNonTermRate(rate)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      nonTermRate === rate
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {rate}%/năm
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Comparison Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* If kept until maturity */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">
                Nếu giữ đến hết kỳ hạn ({termMonths} tháng):
              </span>
              <div className="text-lg font-bold text-slate-800 mt-1 tabular-nums">
                +{formatVND(result.maturityInterest)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Áp dụng lãi suất kỳ hạn: {formatPercent(topBank.ratePercent)}
              </div>
            </div>

            {/* Actual received if early withdrawal */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800 font-semibold block">
                Thực nhận khi rút sau {daysHeld} ngày:
              </span>
              <div className="text-lg font-bold text-amber-900 mt-1 tabular-nums">
                +{formatVND(result.actualInterest)}
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Áp dụng lãi không kỳ hạn: {nonTermRate}%/năm
              </div>
            </div>
          </div>

          {/* Loss Highlight Card */}
          <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Số tiền lãi bị bốc hơi / mất trắng:</span>
              </div>
              <div className="text-3xl font-black text-red-600 tabular-nums mt-1">
                -{formatVND(result.lostInterest)}
              </div>
              <p className="text-xs text-red-700 mt-1">
                Bạn đánh mất <strong>{result.lossPercentage}%</strong> số tiền lãi xứng đáng được hưởng!
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-red-200 text-center shrink-0 w-full sm:w-auto">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                Tỷ lệ hao hụt lãi
              </span>
              <span className="text-2xl font-black text-red-600">
                {result.lossPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* Gợi ý: Hãy chia nhỏ số tiền gửi thành nhiều sổ nếu có nhu cầu dùng tiền đột xuất.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
