'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CalculationResult } from '@/types';
import { formatVND, formatVNDCompact, formatPercent } from '@/lib/formatters';
import { BarChart3, TrendingUp, Layers } from 'lucide-react';

interface GrowthChartProps {
  results: CalculationResult[];
  selectedBankId?: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  results,
  selectedBankId,
}) => {
  const [activeBankId, setActiveBankId] = useState<string>(
    selectedBankId || (results.length > 0 ? results[0].bank.id : '')
  );

  // Fallback to top bank if activeBankId not in results
  const currentBankResult =
    results.find(r => r.bank.id === activeBankId) || results[0];

  if (!currentBankResult) {
    return null;
  }

  const chartData = currentBankResult.monthlyBreakdown.map(item => ({
    name: item.label,
    goc: item.accumulatedPrincipal,
    lai: item.accumulatedInterest,
    tong: item.totalBalance,
    laiThang: item.interestEarnedThisMonth,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-xl text-xs text-white space-y-2 min-w-[210px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-emerald-400 font-semibold">
              {currentBankResult.bank.shortName} ({formatPercent(currentBankResult.ratePercent)})
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                Vốn gốc tích lũy:
              </span>
              <span className="font-semibold text-slate-200 tabular-nums">
                {formatVND(data.goc)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Tiền lãi lũy kế:
              </span>
              <span className="font-bold text-emerald-400 tabular-nums">
                +{formatVND(data.lai)}
              </span>
            </div>
            {data.laiThang > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Lãi sinh ra kỳ này:</span>
                <span className="text-emerald-300 tabular-nums">
                  +{formatVND(data.laiThang)}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between font-bold">
            <span className="text-slate-300">Tổng tài sản:</span>
            <span className="text-white text-sm tabular-nums">
              {formatVND(data.tong)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-fintech border border-slate-200/80">
      {/* Header & Bank Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Biểu đồ tăng trưởng dòng tiền & lãi lũy kế
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Minh họa tốc độ gia tăng giá trị theo từng kỳ gửi
          </p>
        </div>

        {/* Bank Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 shrink-0">
            Xem ngân hàng:
          </label>
          <select
            value={currentBankResult.bank.id}
            onChange={e => setActiveBankId(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            {results.map(r => (
              <option key={r.bank.id} value={r.bank.id}>
                #{r.rank} {r.bank.shortName} - {formatPercent(r.ratePercent)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recharts Area Graph */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorLai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={val => formatVNDCompact(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
              formatter={value => {
                if (value === 'goc') return 'Vốn gốc đã nộp';
                if (value === 'lai') return 'Tiền lãi lũy kế';
                return value;
              }}
            />
            <Area
              type="monotone"
              dataKey="goc"
              stackId="1"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGoc)"
            />
            <Area
              type="monotone"
              dataKey="lai"
              stackId="1"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLai)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>
          Đồ thị mô phỏng sự tích lũy của <strong>{currentBankResult.bank.shortName}</strong> với lãi suất {formatPercent(currentBankResult.ratePercent)}.
        </span>
        <span className="font-semibold text-emerald-700">
          Tổng lãi cuối kỳ: {formatVND(currentBankResult.totalInterest)}
        </span>
      </div>
    </div>
  );
};
