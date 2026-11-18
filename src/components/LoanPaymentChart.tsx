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
  Line,
} from 'recharts';
import { LoanCalculationResult } from '@/types';
import { formatVND, formatVNDCompact, formatPercent } from '@/lib/formatters';
import { TrendingUp, AlertCircle, Layers } from 'lucide-react';

interface LoanPaymentChartProps {
  rankings: LoanCalculationResult[];
  lowestBank: LoanCalculationResult | null;
  highestBank: LoanCalculationResult | null;
}

export const LoanPaymentChart: React.FC<LoanPaymentChartProps> = ({
  rankings,
  lowestBank,
  highestBank,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>(
    lowestBank ? lowestBank.bank.id : rankings[0]?.bank.id || ''
  );

  const activeBank = rankings.find(r => r.bank.id === selectedBankId) || lowestBank || rankings[0];

  if (!activeBank) return null;

  // Downsample data if term > 60 months for crisp chart rendering
  const schedule = activeBank.schedule;
  const step = schedule.length > 120 ? 6 : schedule.length > 60 ? 3 : 1;

  const chartData = schedule
    .filter((_, idx) => idx % step === 0 || idx === schedule.length - 1)
    .map(item => {
      // Find corresponding month in highest bank for comparison
      const highestMonthItem = highestBank?.schedule[item.month - 1];

      return {
        name: item.month % 12 === 0 ? `Năm ${item.month / 12}` : `T.${item.month}`,
        monthNum: item.month,
        goc: item.principalPayment,
        lai: item.interestPayment,
        tongTra: item.totalPayment,
        duNo: item.remainingBalance,
        laiSuat: item.ratePercent,
        isPromo: item.isPromo,
        // Compare with highest bank
        tongTraCaoNhat: highestMonthItem ? highestMonthItem.totalPayment : 0,
      };
    });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-xl text-xs text-white space-y-2 min-w-[220px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>Tháng {data.monthNum}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                data.isPromo
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {data.isPromo ? 'Ưu đãi' : 'Thả nổi'}: {data.laiSuat}%/năm
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gốc trả kỳ này:</span>
              <span className="font-semibold text-slate-200 tabular-nums">
                {formatVND(data.goc)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Lãi trả kỳ này:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {formatVND(data.lai)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-1 font-bold">
              <span className="text-white">Tổng tiền trả tháng:</span>
              <span className="text-emerald-300 text-sm tabular-nums">
                {formatVND(data.tongTra)}
              </span>
            </div>
            {data.tongTraCaoNhat > 0 && (
              <div className="flex items-center justify-between text-[11px] text-rose-300 pt-0.5">
                <span>Gói đắt nhất cùng kỳ:</span>
                <span className="tabular-nums font-semibold">
                  {formatVND(data.tongTraCaoNhat)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Dư nợ còn lại:</span>
              <span className="tabular-nums text-slate-300 font-medium">
                {formatVND(data.duNo)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-fintech border border-slate-200/80">
      {/* Header & Bank Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Biểu đồ biến thiên số tiền trả hàng tháng (Gốc + Lãi)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Minh họa trực quan bước nhảy số tiền trả khi hết hạn ưu đãi và chuyển sang lãi suất thả nổi
          </p>
        </div>

        {/* Bank Selection Dropdown - Constrained to prevent container overflow */}
        <div className="flex items-center gap-2 w-full lg:w-auto lg:max-w-[320px] min-w-0 shrink-0">
          <label className="text-xs font-semibold text-slate-500 shrink-0">
            Xem ngân hàng:
          </label>
          <div className="relative flex-1 min-w-0">
            <select
              value={activeBank.bank.id}
              onChange={e => setSelectedBankId(e.target.value)}
              className="w-full truncate pr-8 pl-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
            >
              {rankings.map(r => (
                <option key={r.bank.id} value={r.bank.id}>
                  #{r.rank} {r.bank.shortName} (Ưu đãi {r.promoRate}% → {r.floatingRate}%)
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
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
              <linearGradient id="colorLoanGoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorLoanLai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.15} />
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
                if (value === 'goc') return 'Tiền gốc trả hàng tháng';
                if (value === 'lai') return 'Tiền lãi trả hàng tháng';
                if (value === 'tongTraCaoNhat') return 'Mức trả của gói lãi cao nhất';
                return value;
              }}
            />
            <Area
              type="monotone"
              dataKey="goc"
              stackId="loan"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLoanGoc)"
            />
            <Area
              type="monotone"
              dataKey="lai"
              stackId="loan"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLoanLai)"
            />
            {highestBank && highestBank.bank.id !== activeBank.bank.id && (
              <Line
                type="monotone"
                dataKey="tongTraCaoNhat"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {activeBank.bank.shortName}: Ưu đãi <strong>{activeBank.promoMonths} tháng đầu</strong> ({activeBank.promoRate}%/năm), sau đó thả nổi ({activeBank.floatingRate}%/năm).
          </span>
        </span>
        <span className="font-semibold text-emerald-700">
          Tổng lãi toàn kỳ: {formatVND(activeBank.totalInterest)}
        </span>
      </div>
    </div>
  );
};
