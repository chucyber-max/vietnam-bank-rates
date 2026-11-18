'use client';

import React, { useState, useMemo } from 'react';
import { LoanCalculationResult, LoanCategory } from '@/types';
import { formatVND, formatPercent, formatDiffVND } from '@/lib/formatters';
import { exportLoanRankingsToCSV } from '@/lib/exportUtils';
import {
  Search,
  ArrowUpDown,
  Download,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

interface LoanRankingTableProps {
  rankings: LoanCalculationResult[];
  category: LoanCategory;
  principal: number;
  termMonths: number;
  onOpenSchedule: (bankResult: LoanCalculationResult) => void;
}

type SortField = 'rank' | 'promoRate' | 'floatingRate' | 'firstMonth' | 'totalInterest' | 'name';
type SortOrder = 'asc' | 'desc';

export const LoanRankingTable: React.FC<LoanRankingTableProps> = ({
  rankings,
  category,
  principal,
  termMonths,
  onOpenSchedule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const categoryLabel =
    category === 'MORTGAGE'
      ? 'Vay mua nhà / Thế chấp'
      : category === 'AUTO'
      ? 'Vay mua ô tô'
      : 'Vay tín chấp tiêu dùng';

  // Filter & Sort
  const filteredRankings = useMemo(() => {
    let list = [...rankings];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        r =>
          r.bank.name.toLowerCase().includes(q) ||
          r.bank.shortName.toLowerCase().includes(q) ||
          r.bank.code.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'rank') {
        comp = a.rank - b.rank;
      } else if (sortField === 'promoRate') {
        comp = a.promoRate - b.promoRate;
      } else if (sortField === 'floatingRate') {
        comp = a.floatingRate - b.floatingRate;
      } else if (sortField === 'firstMonth') {
        comp = a.firstMonthPayment - b.firstMonthPayment;
      } else if (sortField === 'totalInterest') {
        comp = a.totalInterest - b.totalInterest;
      } else if (sortField === 'name') {
        comp = a.bank.shortName.localeCompare(b.bank.shortName);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [rankings, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'asc');
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-900 font-bold text-xs shadow-sm">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-bold text-xs shadow-sm">
          🥉
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
        #{rank}
      </span>
    );
  };

  const getGroupBadgeClass = (group: string) => {
    switch (group) {
      case 'BIG4':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TMCP':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'DIGITAL':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-fintech border border-slate-200/80 space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bảng so sánh gói vay 14 ngân hàng ({categoryLabel})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xếp hạng theo tổng lãi phải trả thấp nhất cho khoản vay {formatVND(principal)} ({termMonths} tháng)
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm ngân hàng VCB, BIDV, TCB..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => exportLoanRankingsToCSV(rankings, categoryLabel, principal, termMonths)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
            title="Tải bảng kết quả so sánh gói vay dạng CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-3 sm:px-4 w-12 text-center">Hạng</th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Ngân hàng</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('promoRate')}
                className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>LS Ưu đãi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('floatingRate')}
                className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>LS Thả nổi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('firstMonth')}
                className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-slate-900 hidden md:table-cell"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Trả tháng đầu</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4 text-right hidden lg:table-cell">Tháng cao nhất</th>
              <th
                onClick={() => handleSort('totalInterest')}
                className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Tổng lãi phải trả</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">Tổng gốc + lãi</th>
              <th className="py-3 px-3 sm:px-4 text-right hidden xl:table-cell">Chênh lệch</th>
              <th className="py-3 px-3 sm:px-4 text-center w-28">Lịch trả nợ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRankings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  Không tìm thấy ngân hàng nào khớp với từ khóa &quot;{searchTerm}&quot;.
                </td>
              </tr>
            ) : (
              filteredRankings.map(item => {
                const isTop1 = item.rank === 1;

                return (
                  <tr
                    key={item.bank.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isTop1 ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-3 sm:px-4 text-center font-bold">
                      {getRankBadge(item.rank)}
                    </td>

                    {/* Bank Info */}
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0"
                          style={{ backgroundColor: item.bank.brandColor || '#475569' }}
                        >
                          {item.bank.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">
                              {item.bank.shortName}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold border ${getGroupBadgeClass(
                                item.bank.groupType
                              )}`}
                            >
                              {item.bank.groupType}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-xs">
                            Phí trả trước hạn: {item.loanRate.earlyFeePercent}%
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Promo Rate */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums">
                      <div className="font-extrabold text-emerald-700 sm:text-sm">
                        {item.promoRate}%/năm
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        ({item.promoMonths} tháng)
                      </div>
                    </td>

                    {/* Floating Rate */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums">
                      <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                        {item.floatingRate}%/năm
                      </span>
                    </td>

                    {/* First Month Payment */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums text-slate-700 font-semibold hidden md:table-cell">
                      {formatVND(item.firstMonthPayment)}
                    </td>

                    {/* Max Monthly Payment */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums text-slate-600 hidden lg:table-cell">
                      {formatVND(item.maxMonthlyPayment)}
                    </td>

                    {/* Total Interest (Bold Emerald) */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums">
                      <div className="font-black text-emerald-600 sm:text-base">
                        +{formatVND(item.totalInterest)}
                      </div>
                    </td>

                    {/* Grand Total Repayment */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums hidden sm:table-cell">
                      <div className="font-bold text-slate-900">
                        {formatVND(item.totalRepayment)}
                      </div>
                    </td>

                    {/* Difference from lowest */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums hidden xl:table-cell">
                      {item.differenceFromLowest > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          +{formatVND(item.differenceFromLowest)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700">Gói tốt nhất</span>
                      )}
                    </td>

                    {/* Amortization Schedule Button */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenSchedule(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-all shadow-sm"
                        title="Xem bảng lịch trả nợ từng tháng chi tiết"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Xem lịch</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 text-center sm:hidden">
        Vuốt sang phải để xem đầy đủ cột lãi suất ưu đãi, thả nổi và tiền lãi phải trả.
      </div>
    </div>
  );
};
