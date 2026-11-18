'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, TrendingUp, ShieldCheck, Database, Award, ArrowUpRight, Lock, HandCoins, Percent, Calendar } from 'lucide-react';
import { CalculationResult } from '@/types';
import { formatPercent } from '@/lib/formatters';

interface HeaderProps {
  activeTab?: 'savings' | 'loan';
  results?: CalculationResult[];
  lastUpdated?: string;
  source?: 'SUPABASE' | 'LOCAL_FALLBACK';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'savings',
  results = [],
  lastUpdated = 'Hôm nay',
  source = 'LOCAL_FALLBACK',
}) => {
  // Compute savings summary stats
  const highestRate = results.length > 0 ? Math.max(...results.map(r => r.ratePercent)) : 0;
  const bestBank = results.find(r => r.ratePercent === highestRate);
  
  const avgRate = results.length > 0
    ? results.reduce((acc, curr) => acc + curr.ratePercent, 0) / results.length
    : 0;

  const big4Banks = results.filter(r => r.bank.groupType === 'BIG4');
  const big4Avg = big4Banks.length > 0
    ? big4Banks.reduce((acc, curr) => acc + curr.ratePercent, 0) / big4Banks.length
    : 0;

  const isLoan = activeTab === 'loan';

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60">
      {/* Background glowing ambient light */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 ${isLoan ? 'bg-blue-500/10' : 'bg-emerald-500/10'} rounded-full blur-3xl pointer-events-none transition-colors duration-500`} />
      <div className={`absolute top-1/2 right-1/4 w-96 h-96 ${isLoan ? 'bg-indigo-500/10' : 'bg-blue-500/10'} rounded-full blur-3xl pointer-events-none transition-colors duration-500`} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top bar with Badge & Admin Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 ${isLoan ? 'bg-blue-500/20 border-blue-400/30 text-blue-400' : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'} border rounded-xl shadow-inner transition-colors`}>
              {isLoan ? <HandCoins className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
            </div>
            <div>
              <span className={`text-xs font-semibold tracking-wider uppercase block ${isLoan ? 'text-blue-400' : 'text-emerald-400'}`}>
                {isLoan ? 'FinTech Vietnam • Công cụ so sánh khoản vay' : 'FinTech Vietnam • Công cụ tài chính độc lập'}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {isLoan ? 'So Sánh Lãi Suất Vay Ngân Hàng' : 'Tính Lãi & So Sánh Tiết Kiệm Ngân Hàng'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLoan ? 'bg-blue-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoan ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span>Cập nhật: {lastUpdated}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>{source === 'SUPABASE' ? 'Supabase Live' : 'Dữ liệu chuẩn 14 NH'}</span>
            </div>

            <Link
              href="/admin/rates"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-white transition-all shadow-sm group"
              title="Mở bảng quản trị ma trận lãi suất ngân hàng"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span>Quản trị</span>
            </Link>
          </div>
        </div>

        {/* Subtitle description */}
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
          {isLoan ? (
            <>
              Hệ thống đối soát & mô phỏng lịch trả nợ vay mua nhà, mua ô tô, tín chấp giữa{' '}
              <strong className="text-blue-400 font-semibold">14 ngân hàng hàng đầu Việt Nam</strong>.
              Hỗ trợ tính <span className="text-white underline decoration-blue-500 underline-offset-4 font-medium">Theo gói ngân hàng (Ưu đãi + Thả nổi)</span>, <span className="text-white underline decoration-indigo-500 underline-offset-4 font-medium">Dư nợ giảm dần</span> và <span className="text-white underline decoration-sky-500 underline-offset-4 font-medium">Trả góp đều</span>.
            </>
          ) : (
            <>
              Hệ thống tính toán lợi suất tiết kiệm thông minh và đối soát lãi suất thực tế giữa{' '}
              <strong className="text-emerald-400 font-semibold">14 ngân hàng hàng đầu Việt Nam</strong> (Big4, TMCP, Ngân hàng số).
              Hỗ trợ tính <span className="text-white underline decoration-emerald-500 underline-offset-4 font-medium">Gửi tích lũy hàng tháng</span> và <span className="text-white underline decoration-blue-500 underline-offset-4 font-medium">Gửi có kỳ hạn 1 lần</span> với chế độ tái tục lãi kép.
            </>
          )}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {isLoan ? (
            <>
              {/* Loan Card 1 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-blue-500/50 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Ưu đãi thấp nhất</span>
                  <Award className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 tabular-nums">
                  5.50%
                </div>
                <div className="text-xs text-slate-400 mt-1 truncate">
                  VCB, BIDV, Techcombank
                </div>
              </div>

              {/* Loan Card 2 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-indigo-500/50 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Thả nổi trung bình</span>
                  <Percent className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">
                  10.15%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Biên độ thả nổi 3.5% - 4.5%
                </div>
              </div>

              {/* Loan Card 3 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-slate-600 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Kỳ hạn hỗ trợ</span>
                  <Calendar className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-slate-200 tabular-nums">
                  1 - 25 năm
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Lên đến 300 tháng
                </div>
              </div>

              {/* Loan Card 4 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-slate-600 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Quy mô so sánh</span>
                  <Landmark className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-200 tabular-nums">
                  14 / 14
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span>Mua nhà, ô tô, tín chấp</span>
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Savings Card 1 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-emerald-500/50 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Lãi suất cao nhất</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {formatPercent(highestRate)}
                </div>
                <div className="text-xs text-slate-400 mt-1 truncate">
                  {bestBank ? `${bestBank.bank.shortName} (${bestBank.bank.groupType})` : 'Chưa có dữ liệu'}
                </div>
              </div>

              {/* Savings Card 2 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-blue-500/50 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Trung bình thị trường</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">
                  {formatPercent(avgRate)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  14 ngân hàng được khảo sát
                </div>
              </div>

              {/* Savings Card 3 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-slate-600 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Trung bình nhóm Big4</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-slate-200 tabular-nums">
                  {formatPercent(big4Avg)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  VCB, BIDV, Agribank, CTG
                </div>
              </div>

              {/* Savings Card 4 */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-4 transition-all hover:border-slate-600 hover:bg-slate-800/90">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Quy mô so sánh</span>
                  <Landmark className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-200 tabular-nums">
                  14 / 14
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span>Đầy đủ 3 nhóm tổ chức</span>
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
