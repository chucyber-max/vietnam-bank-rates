'use client';

import React, { useState } from 'react';
import { LoanCalculationResult } from '@/types';
import { formatVND, formatPercent } from '@/lib/formatters';
import { exportLoanScheduleToCSV } from '@/lib/exportUtils';
import {
  X,
  Calendar,
  Download,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Info,
} from 'lucide-react';

interface LoanAmortizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LoanCalculationResult | null;
}

export const LoanAmortizationModal: React.FC<LoanAmortizationModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [filterPhase, setFilterPhase] = useState<'ALL' | 'PROMO' | 'FLOATING'>('ALL');

  if (!isOpen || !result) return null;

  const filteredSchedule = result.schedule.filter(item => {
    if (filterPhase === 'PROMO') return item.isPromo;
    if (filterPhase === 'FLOATING') return !item.isPromo;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0"
              style={{ backgroundColor: result.bank.brandColor || '#059669' }}
            >
              {result.bank.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Lịch trả nợ chi tiết — {result.bank.shortName}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-semibold text-slate-700">
                  {result.bank.groupType}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gốc vay: <strong className="text-slate-800">{formatVND(result.principal)}</strong> • Thời hạn: <strong className="text-slate-800">{result.termMonths} tháng</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                exportLoanScheduleToCSV(
                  result.bank.shortName,
                  result.principal,
                  result.termMonths,
                  result.schedule
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất tệp CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-100/70 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Lãi suất gói</span>
            <div className="font-bold text-slate-800">
              {result.promoRate}% ({result.promoMonths}T) → {result.floatingRate}%
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Trả tháng đầu</span>
            <div className="font-bold text-slate-800 tabular-nums">
              {formatVND(result.firstMonthPayment)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tổng lãi phải trả</span>
            <div className="font-extrabold text-emerald-600 tabular-nums">
              +{formatVND(result.totalInterest)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tổng gốc + lãi</span>
            <div className="font-extrabold text-slate-900 tabular-nums">
              {formatVND(result.totalRepayment)}
            </div>
          </div>
        </div>

        {/* Filter Phase Buttons */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">Lọc danh sách:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFilterPhase('ALL')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                filterPhase === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toàn bộ ({result.schedule.length} tháng)
            </button>
            <button
              type="button"
              onClick={() => setFilterPhase('PROMO')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                filterPhase === 'PROMO'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Giai đoạn ưu đãi ({result.promoMonths} tháng)
            </button>
            <button
              type="button"
              onClick={() => setFilterPhase('FLOATING')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                filterPhase === 'FLOATING'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Giai đoạn thả nổi ({Math.max(0, result.termMonths - result.promoMonths)} tháng)
            </button>
          </div>
        </div>

        {/* Modal Scrollable Table */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 w-16 text-center">Kỳ</th>
                  <th className="py-3 px-3 text-right">Dư nợ đầu kỳ</th>
                  <th className="py-3 px-3 text-right">Gốc trả</th>
                  <th className="py-3 px-3 text-right">Lãi trả</th>
                  <th className="py-3 px-3 text-right">Tổng tiền trả</th>
                  <th className="py-3 px-3 text-right">Dư nợ cuối kỳ</th>
                  <th className="py-3 px-3 text-center">Lãi suất</th>
                  <th className="py-3 px-3 text-center">Giai đoạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {filteredSchedule.map(item => (
                  <tr key={item.month} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      T.{item.month}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatVND(item.beginningBalance)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-700">
                      {formatVND(item.principalPayment)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                      {formatVND(item.interestPayment)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatVND(item.totalPayment)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {formatVND(item.remainingBalance)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      {item.ratePercent}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.isPromo
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.isPromo ? 'Ưu đãi' : 'Thả nổi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* Lãi suất thực tế được điều chỉnh theo biên độ quy định của từng ngân hàng tại ngày giải ngân.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
};
