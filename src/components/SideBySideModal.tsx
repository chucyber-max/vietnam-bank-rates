'use client';

import React from 'react';
import { CalculationResult, SavingsMode, TermMonths } from '@/types';
import { formatVND, formatPercent, formatDiffVND } from '@/lib/formatters';
import { exportResultsToCSV } from '@/lib/exportUtils';
import {
  X,
  Layers,
  Download,
  TrendingUp,
  CheckCircle2,
  Award,
  Calendar,
} from 'lucide-react';

interface SideBySideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBanks: CalculationResult[];
  mode: SavingsMode;
  termMonths: TermMonths;
  depositType: string;
  amount: number;
}

export const SideBySideModal: React.FC<SideBySideModalProps> = ({
  isOpen,
  onClose,
  selectedBanks,
  mode,
  termMonths,
  depositType,
  amount,
}) => {
  if (!isOpen) return null;

  // Find max interest in this group to calculate relative performance
  const maxInterest = Math.max(...selectedBanks.map(b => b.totalInterest));

  // Determine months list from the longest breakdown
  const maxMonths = selectedBanks.reduce(
    (max, b) => Math.max(max, b.monthlyBreakdown.length),
    0
  );
  const monthsArray = Array.from({ length: maxMonths }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Đối chiếu chi tiết song song {selectedBanks.length} ngân hàng
              </h3>
              <p className="text-xs text-slate-500">
                Kỳ hạn {termMonths} tháng • Kênh {depositType === 'ONLINE' ? 'Online' : 'Tại quầy'} •{' '}
                {mode === 'MONTHLY' ? 'Tích lũy hàng tháng' : 'Gửi một lần'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportResultsToCSV(selectedBanks, mode, termMonths, depositType, amount)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất CSV</span>
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

        {/* Modal Content Scrollable */}
        <div className="overflow-y-auto p-6 space-y-6">
          {selectedBanks.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Chưa có ngân hàng nào được chọn. Vui lòng tick chọn ít nhất 1 ngân hàng ở bảng so sánh.
            </div>
          ) : (
            <>
              {/* Top Overview Cards Grid */}
              <div
                className={`grid gap-4 ${
                  selectedBanks.length === 1
                    ? 'grid-cols-1'
                    : selectedBanks.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-3'
                }`}
              >
                {selectedBanks.map(item => {
                  const isTopYield = item.totalInterest === maxInterest;
                  return (
                    <div
                      key={item.bank.id}
                      className={`rounded-2xl p-5 border transition-all ${
                        isTopYield
                          ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white shadow-sm'
                      }`}
                    >
                      {/* Bank Identity */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm"
                            style={{ backgroundColor: item.bank.brandColor || '#334155' }}
                          >
                            {item.bank.code}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-base">
                              {item.bank.shortName}
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                              {item.bank.groupType}
                            </span>
                          </div>
                        </div>

                        {isTopYield && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                            <Award className="w-3 h-3" />
                            Tốt nhất
                          </span>
                        )}
                      </div>

                      {/* Rate */}
                      <div className="mb-4 pb-3 border-b border-slate-100">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">
                          Lãi suất áp dụng
                        </span>
                        <div className="text-2xl font-black text-emerald-600 tabular-nums">
                          {formatPercent(item.ratePercent)}
                        </div>
                      </div>

                      {/* Key numbers */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Vốn gốc nạp:</span>
                          <span className="font-semibold text-slate-800 tabular-nums">
                            {formatVND(item.totalPrincipal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Tiền lãi nhận:</span>
                          <span className="font-black text-emerald-600 tabular-nums">
                            +{formatVND(item.totalInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
                          <span>Tổng thực nhận:</span>
                          <span className="tabular-nums text-sm">
                            {formatVND(item.totalReceived)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Month by month trajectory table comparison */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Bảng so sánh dòng tiền tích lũy chi tiết qua từng tháng
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-2.5 px-3 w-20">Kỳ/Tháng</th>
                        {selectedBanks.map(b => (
                          <th key={b.bank.id} className="py-2.5 px-3 text-right">
                            {b.bank.shortName} (Lãi / Tổng nhận)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthsArray.map(m => {
                        return (
                          <tr key={m} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              Tháng {m}
                            </td>
                            {selectedBanks.map(b => {
                              const step = b.monthlyBreakdown[m - 1];
                              if (!step) {
                                return (
                                  <td key={b.bank.id} className="py-2.5 px-3 text-right text-slate-300">
                                    -
                                  </td>
                                );
                              }
                              return (
                                <td key={b.bank.id} className="py-2.5 px-3 text-right tabular-nums">
                                  <span className="text-emerald-600 font-semibold mr-1.5">
                                    +{formatVND(step.accumulatedInterest)}
                                  </span>
                                  <span className="text-slate-400">/</span>
                                  <span className="font-bold text-slate-800 ml-1.5">
                                    {formatVND(step.totalBalance)}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* Lãi suất có thể được áp dụng biểu lãi ưu đãi trực tuyến tùy từng tài khoản ngân hàng.</span>
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
