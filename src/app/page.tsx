'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PiggyBank, HandCoins, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { SavingsCalculator } from '@/components/SavingsCalculator';
import { LoanCalculator } from '@/components/LoanCalculator';

function HomeContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'loan' ? 'loan' : 'savings';
  const [activeTab, setActiveTab] = useState<'savings' | 'loan'>(initialTab);

  // Sync tab with URL search parameter if changed externally
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'loan' && activeTab !== 'loan') {
      setActiveTab('loan');
    } else if (tabParam === 'savings' && activeTab !== 'savings') {
      setActiveTab('savings');
    }
  }, [searchParams, activeTab]);

  const handleSelectTab = (tab: 'savings' | 'loan') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Dynamic Header */}
      <Header activeTab={activeTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Prominent 2-Card Dual-Mode Hero Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Option 1 Card: Gửi Tiền Lãi */}
          <button
            type="button"
            onClick={() => handleSelectTab('savings')}
            className={`group relative text-left p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 shadow-sm ${
              activeTab === 'savings'
                ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10 scale-[1.01]'
                : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-emerald-300/80 opacity-80 hover:opacity-100 hover:scale-[1.005]'
            }`}
          >
            {activeTab === 'savings' && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Đang chọn</span>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl transition-all ${
                  activeTab === 'savings'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                }`}
              >
                <PiggyBank className="w-8 h-8" />
              </div>

              <div className="flex-1 min-w-0 pr-16 sm:pr-0">
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-600 block mb-1">
                  Mục tiêu sinh lời • Tích lũy
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>1. Gửi Tiền Lãi</span>
                  <ArrowRight
                    className={`w-5 h-5 transition-transform ${
                      activeTab === 'savings'
                        ? 'text-emerald-600 translate-x-1'
                        : 'text-slate-400 group-hover:translate-x-1'
                    }`}
                  />
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Tính lãi gửi góp hàng tháng & gửi có kỳ hạn 1 lần — Tự động xếp hạng & tìm ngân hàng có lợi suất thực nhận cao nhất.
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100/60 text-emerald-800">
                    Gửi góp tích lũy
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100/60 text-emerald-800">
                    Lãi kép tái tục
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100/60 text-emerald-800">
                    Cảnh báo rút trước hạn
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Option 2 Card: Vay Tiền Lãi */}
          <button
            type="button"
            onClick={() => handleSelectTab('loan')}
            className={`group relative text-left p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 shadow-sm ${
              activeTab === 'loan'
                ? 'bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/10 scale-[1.01]'
                : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-blue-300/80 opacity-80 hover:opacity-100 hover:scale-[1.005]'
            }`}
          >
            {activeTab === 'loan' && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Đang chọn</span>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl transition-all ${
                  activeTab === 'loan'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                }`}
              >
                <HandCoins className="w-8 h-8" />
              </div>

              <div className="flex-1 min-w-0 pr-16 sm:pr-0">
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-blue-600 block mb-1">
                  Mục tiêu vốn vay • Tối ưu chi phí
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>2. Vay Tiền Lãi</span>
                  <ArrowRight
                    className={`w-5 h-5 transition-transform ${
                      activeTab === 'loan'
                        ? 'text-blue-600 translate-x-1'
                        : 'text-slate-400 group-hover:translate-x-1'
                    }`}
                  />
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  So sánh lãi suất vay mua nhà, mua ô tô, tín chấp tiêu dùng — Tìm gói vay ưu đãi rẻ nhất & kiểm soát bẫy lãi thả nổi.
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100/60 text-blue-800">
                    2 giai đoạn ưu đãi + thả nổi
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100/60 text-blue-800">
                    Dư nợ giảm dần & Đều
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100/60 text-blue-800">
                    Xuất Excel lịch trả nợ
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Dynamic Calculator Content Area */}
        {activeTab === 'savings' ? (
          <SavingsCalculator />
        ) : (
          <LoanCalculator />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800 mt-12 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-semibold text-slate-300">
              Vietnam Bank Savings & Loan Interest Comparator © {new Date().getFullYear()}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hệ thống đối soát lãi suất tiền gửi & lãi suất vay độc lập giữa 14 ngân hàng Việt Nam. Lãi suất niêm yết mang tính tham khảo và có thể thay đổi theo từng thời kỳ.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {activeTab === 'savings' ? (
              <>
                <a href="#bang-so-sanh" className="hover:text-emerald-400 transition-colors">
                  Bảng xếp hạng tiết kiệm
                </a>
                <span>•</span>
                <a href="#cam-nang" className="hover:text-emerald-400 transition-colors">
                  Cẩm nang gửi tiền
                </a>
              </>
            ) : (
              <>
                <a href="#bang-so-sanh-vay" className="hover:text-blue-400 transition-colors">
                  Bảng so sánh gói vay
                </a>
                <span>•</span>
                <a href="#cam-nang-vay" className="hover:text-blue-400 transition-colors">
                  Cẩm nang vay vốn
                </a>
              </>
            )}
            <span>•</span>
            <Link href="/admin/rates" className="hover:text-emerald-400 transition-colors">
              Quản trị lãi suất
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs">Đang tải công cụ so sánh lãi suất...</span>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
