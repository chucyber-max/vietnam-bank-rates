'use client';

import React, { useState, useMemo } from 'react';
import { CalculationResult, SavingsMode, TermMonths } from '@/types';
import { formatVND, formatPercent, formatDiffVND } from '@/lib/formatters';
import { exportResultsToCSV } from '@/lib/exportUtils';
import {
  Search,
  ArrowUpDown,
  Download,
  CheckSquare,
  Square,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';

interface BankComparisonTableProps {
  results: CalculationResult[];
  mode: SavingsMode;
  termMonths: TermMonths;
  depositType: string;
  amount: number;
  selectedCompareIds: string[];
  onToggleCompare: (bankId: string) => void;
  onOpenSideBySideModal: () => void;
}

type SortField = 'rank' | 'rate' | 'interest' | 'name';
type SortOrder = 'asc' | 'desc';

export const BankComparisonTable: React.FC<BankComparisonTableProps> = ({
  results,
  mode,
  termMonths,
  depositType,
  amount,
  selectedCompareIds,
  onToggleCompare,
  onOpenSideBySideModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter & Sort
  const filteredResults = useMemo(() => {
    let list = [...results];

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
      } else if (sortField === 'rate') {
        comp = b.ratePercent - a.ratePercent;
      } else if (sortField === 'interest') {
        comp = b.totalInterest - a.totalInterest;
      } else if (sortField === 'name') {
        comp = a.bank.shortName.localeCompare(b.bank.shortName);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [results, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
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
              Bảng xếp hạng lãi suất & thực nhận 14 ngân hàng
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xếp hạng theo lãi suất thực tế giảm dần cho kỳ hạn {termMonths} tháng
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên ngân hàng, VCB, MB..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => exportResultsToCSV(results, mode, termMonths, depositType, amount)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
            title="Tải bảng kết quả dạng tệp CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          {/* Compare Modal Opener */}
          {selectedCompareIds.length > 0 && (
            <button
              type="button"
              onClick={onOpenSideBySideModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all animate-pulse"
            >
              <Layers className="w-4 h-4" />
              <span>Đối chiếu {selectedCompareIds.length}/3 ngân hàng</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating compare tip bar */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">Mẹo đối chiếu:</span>
          <span>Chọn tối đa 3 ngân hàng ở cột &quot;So sánh&quot; để mở bảng phân tích so sánh chi tiết song song.</span>
        </div>
        <span className="font-semibold text-emerald-700 shrink-0">
          Đã chọn: {selectedCompareIds.length}/3
        </span>
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
                onClick={() => handleSort('rate')}
                className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Lãi suất</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4 text-right hidden md:table-cell">Tổng gốc</th>
              <th
                onClick={() => handleSort('interest')}
                className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Tiền lãi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4 text-right">Tổng thực nhận</th>
              <th className="py-3 px-3 sm:px-4 text-right hidden lg:table-cell">Chênh lệch</th>
              <th className="py-3 px-3 sm:px-4 text-center w-20">So sánh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Không tìm thấy ngân hàng nào khớp với từ khóa &quot;{searchTerm}&quot;.
                </td>
              </tr>
            ) : (
              filteredResults.map(item => {
                const isSelectedForCompare = selectedCompareIds.includes(item.bank.id);
                const isTop1 = item.rank === 1;

                return (
                  <tr
                    key={item.bank.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isTop1 ? 'bg-emerald-50/20' : ''
                    } ${isSelectedForCompare ? 'bg-emerald-50/40 ring-1 ring-emerald-500/30' : ''}`}
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
                            {item.bank.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-100/70 text-emerald-800 tabular-nums">
                        {formatPercent(item.ratePercent)}
                      </span>
                    </td>

                    {/* Total Principal */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums text-slate-600 hidden md:table-cell">
                      {formatVND(item.totalPrincipal)}
                    </td>

                    {/* Total Interest (Bold Emerald) */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums">
                      <div className="font-extrabold text-emerald-600 sm:text-base">
                        +{formatVND(item.totalInterest)}
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums">
                      <div className="font-bold text-slate-900">
                        {formatVND(item.totalReceived)}
                      </div>
                    </td>

                    {/* Difference from lowest */}
                    <td className="py-3.5 px-3 sm:px-4 text-right tabular-nums hidden lg:table-cell">
                      {item.differenceFromLowest > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {formatDiffVND(item.differenceFromLowest)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Mức sàn</span>
                      )}
                    </td>

                    {/* Compare Selection Checkbox */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleCompare(item.bank.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          isSelectedForCompare
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={
                          isSelectedForCompare
                            ? 'Bỏ chọn so sánh'
                            : selectedCompareIds.length >= 3
                            ? 'Đã chọn tối đa 3 ngân hàng'
                            : 'Chọn để so sánh chi tiết'
                        }
                      >
                        {isSelectedForCompare ? (
                          <CheckSquare className="w-5 h-5 fill-emerald-600 text-white" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Hint */}
      <div className="text-[11px] text-slate-400 text-center sm:hidden">
        Vuốt sang phải để xem đầy đủ cột lãi suất, tiền lãi và chênh lệch.
      </div>
    </div>
  );
};
