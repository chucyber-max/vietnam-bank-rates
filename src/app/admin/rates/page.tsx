'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Bank,
  DepositType,
  TermMonths,
  LoanCategory,
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { MOCK_BANKS, MOCK_DEPOSIT_RATES } from '@/data/mockRates';
import { getMockLoanRates } from '@/data/mockLoanRates';
import {
  Lock,
  Unlock,
  KeyRound,
  RefreshCw,
  Save,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  TableProperties,
  LogOut,
  Loader2,
  PiggyBank,
  HandCoins,
  Home,
  Car,
  CreditCard,
} from 'lucide-react';

const TERMS: TermMonths[] = [1, 3, 6, 9, 12, 18, 24];

interface ModifiedDepositCell {
  bankId: string;
  depositType: DepositType;
  termMonths: TermMonths;
  originalRate: number;
  newRate: number;
}

interface LoanRateValues {
  promoRate: number;
  promoMonths: number;
  floatingRate: number;
  earlyFeePercent: number;
}

interface ModifiedLoanItem {
  bankId: string;
  category: LoanCategory;
  original: LoanRateValues;
  current: LoanRateValues;
}

export default function AdminRatesPage() {
  // Password protection state
  const [password, setPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');

  // Primary Section Tab: DEPOSIT vs LOAN
  const [activeSection, setActiveSection] = useState<'DEPOSIT' | 'LOAN'>('DEPOSIT');

  // Deposit Matrix State
  const [banks, setBanks] = useState<Bank[]>([]);
  const [activeChannel, setActiveChannel] = useState<DepositType>('ONLINE');
  const [ratesMap, setRatesMap] = useState<Record<string, number>>({}); // key: `${bankId}_${depositType}_${term}`
  const [modifiedDepositCells, setModifiedDepositCells] = useState<Record<string, ModifiedDepositCell>>({});

  // Loan Matrix State
  const [activeLoanCategory, setActiveLoanCategory] = useState<LoanCategory>('MORTGAGE');
  const [loanRatesMap, setLoanRatesMap] = useState<Record<string, LoanRateValues>>({}); // key: `${bankId}_${category}`
  const [modifiedLoanCells, setModifiedLoanCells] = useState<Record<string, ModifiedLoanItem>>({});

  // UI status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [alertBanner, setAlertBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Verify password with server
  const verifyPasswordWithServer = async (pwToVerify: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwToVerify,
        },
        body: JSON.stringify({ password: pwToVerify }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // Check persistent session on initial mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (typeof window !== 'undefined') {
        const savedToken =
          sessionStorage.getItem('admin_secret_token') ||
          sessionStorage.getItem('admin_secret');

        if (savedToken) {
          const isValid = await verifyPasswordWithServer(savedToken);
          if (isMounted) {
            if (isValid) {
              setPassword(savedToken);
              sessionStorage.setItem('admin_secret_token', savedToken);
              setIsUnlocked(true);
            } else {
              sessionStorage.removeItem('admin_secret_token');
              sessionStorage.removeItem('admin_secret');
            }
          }
        }
      }
      if (isMounted) {
        setIsCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch banks, deposit rates, and loan rates
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setAlertBanner(null);

    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Fetch banks
        const { data: banksData, error: bErr } = await supabase
          .from('banks')
          .select('*')
          .order('code', { ascending: true });

        if (bErr || !banksData || banksData.length === 0) {
          throw bErr || new Error('Could not fetch banks from Supabase');
        }

        const formattedBanks: Bank[] = banksData.map((b: any) => ({
          id: b.id,
          code: b.code,
          name: b.name,
          shortName: b.short_name,
          groupType: b.group_type,
          brandColor: b.brand_color,
          logoUrl: b.logo_url,
        }));
        setBanks(formattedBanks);

        // 2. Fetch deposit_rates
        const { data: ratesData, error: rErr } = await supabase
          .from('deposit_rates')
          .select('*');

        if (!rErr && ratesData) {
          const map: Record<string, number> = {};
          ratesData.forEach((r: any) => {
            const key = `${r.bank_id}_${r.deposit_type}_${r.term_months}`;
            map[key] = parseFloat(r.rate_percent);
          });
          setRatesMap(map);
        }

        // 3. Fetch loan_rates
        const { data: loanData, error: lErr } = await supabase
          .from('loan_rates')
          .select('*');

        const loanMap: Record<string, LoanRateValues> = {};
        if (!lErr && loanData && loanData.length > 0) {
          loanData.forEach((r: any) => {
            const key = `${r.bank_id}_${r.loan_type}`;
            loanMap[key] = {
              promoRate: parseFloat(r.promo_rate),
              promoMonths: r.promo_months || 12,
              floatingRate: parseFloat(r.floating_rate),
              earlyFeePercent: parseFloat(r.early_fee_percent || '1.5'),
            };
          });
        } else {
          // Fallback loan data for all banks and categories
          (['MORTGAGE', 'AUTO', 'UNSECURED'] as LoanCategory[]).forEach(cat => {
            const mock = getMockLoanRates(cat);
            formattedBanks.forEach(b => {
              const r = mock.find(m => m.bankId === b.id);
              const key = `${b.id}_${cat}`;
              loanMap[key] = {
                promoRate: r?.promoRate || (b.groupType === 'BIG4' ? 5.6 : 6.8),
                promoMonths: r?.promoMonths || 12,
                floatingRate: r?.floatingRate || (b.groupType === 'BIG4' ? 9.3 : 10.8),
                earlyFeePercent: r?.earlyFeePercent || 1.5,
              };
            });
          });
        }
        setLoanRatesMap(loanMap);
      } else {
        // Fallback to local data
        const sortedMockBanks = [...MOCK_BANKS].sort((a, b) => a.code.localeCompare(b.code));
        setBanks(sortedMockBanks);

        const map: Record<string, number> = {};
        MOCK_DEPOSIT_RATES.forEach(r => {
          const key = `${r.bankId}_${r.depositType}_${r.termMonths}`;
          map[key] = r.ratePercent;
        });
        setRatesMap(map);

        const loanMap: Record<string, LoanRateValues> = {};
        (['MORTGAGE', 'AUTO', 'UNSECURED'] as LoanCategory[]).forEach(cat => {
          const mock = getMockLoanRates(cat);
          sortedMockBanks.forEach(b => {
            const r = mock.find(m => m.bankId === b.id);
            const key = `${b.id}_${cat}`;
            loanMap[key] = {
              promoRate: r?.promoRate || (b.groupType === 'BIG4' ? 5.6 : 6.8),
              promoMonths: r?.promoMonths || 12,
              floatingRate: r?.floatingRate || (b.groupType === 'BIG4' ? 9.3 : 10.8),
              earlyFeePercent: r?.earlyFeePercent || 1.5,
            };
          });
        });
        setLoanRatesMap(loanMap);
      }

      setModifiedDepositCells({});
      setModifiedLoanCells({});
    } catch (err: any) {
      console.warn('Fetch matrix notice:', err);
      const sortedMockBanks = [...MOCK_BANKS].sort((a, b) => a.code.localeCompare(b.code));
      setBanks(sortedMockBanks);

      const map: Record<string, number> = {};
      MOCK_DEPOSIT_RATES.forEach(r => {
        const key = `${r.bankId}_${r.depositType}_${r.termMonths}`;
        map[key] = r.ratePercent;
      });
      setRatesMap(map);

      const loanMap: Record<string, LoanRateValues> = {};
      (['MORTGAGE', 'AUTO', 'UNSECURED'] as LoanCategory[]).forEach(cat => {
        const mock = getMockLoanRates(cat);
        sortedMockBanks.forEach(b => {
          const r = mock.find(m => m.bankId === b.id);
          const key = `${b.id}_${cat}`;
          loanMap[key] = {
            promoRate: r?.promoRate || (b.groupType === 'BIG4' ? 5.6 : 6.8),
            promoMonths: r?.promoMonths || 12,
            floatingRate: r?.floatingRate || (b.groupType === 'BIG4' ? 9.3 : 10.8),
            earlyFeePercent: r?.earlyFeePercent || 1.5,
          };
        });
      });
      setLoanRatesMap(loanMap);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      fetchData();
    }
  }, [isUnlocked, fetchData]);

  // Handle Server-Side Login Verification
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPw = password.trim();

    if (!cleanPw) {
      setAuthError('Vui lòng nhập mật mã quản trị viên.');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': cleanPw,
        },
        body: JSON.stringify({ password: cleanPw }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Mật khẩu quản trị không chính xác. Vui lòng thử lại.');
        return;
      }

      // Verified successfully
      setPassword(cleanPw);
      setIsUnlocked(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_secret_token', cleanPw);
      }
    } catch (err: any) {
      setAuthError('Không thể kết nối đến máy chủ xác thực: ' + (err.message || 'Lỗi mạng'));
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsUnlocked(false);
    setPassword('');
    setModifiedDepositCells({});
    setModifiedLoanCells({});
    setAuthError('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_secret_token');
      sessionStorage.removeItem('admin_secret');
    }
  };

  // Handle Deposit cell modification
  const handleDepositRateChange = (
    bankId: string,
    depositType: DepositType,
    termMonths: TermMonths,
    newValStr: string
  ) => {
    const key = `${bankId}_${depositType}_${termMonths}`;
    const originalRate = ratesMap[key] ?? 0;
    const cleanNum = parseFloat(newValStr);

    if (isNaN(cleanNum) || cleanNum < 0 || cleanNum > 20) {
      return;
    }

    const rounded = Number(cleanNum.toFixed(2));

    if (rounded === originalRate) {
      setModifiedDepositCells(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setModifiedDepositCells(prev => ({
        ...prev,
        [key]: {
          bankId,
          depositType,
          termMonths,
          originalRate,
          newRate: rounded,
        },
      }));
    }
  };

  // Handle Loan cell modification
  const handleLoanFieldChange = (
    bankId: string,
    category: LoanCategory,
    field: keyof LoanRateValues,
    valueStr: string
  ) => {
    const key = `${bankId}_${category}`;
    const orig = loanRatesMap[key] || {
      promoRate: 6.5,
      promoMonths: 12,
      floatingRate: 10.5,
      earlyFeePercent: 1.5,
    };

    const val = parseFloat(valueStr);
    if (isNaN(val) || val < 0) return;

    setModifiedLoanCells(prev => {
      const existing = prev[key] || {
        bankId,
        category,
        original: { ...orig },
        current: { ...orig },
      };

      const updatedCurrent = {
        ...existing.current,
        [field]: Number(val.toFixed(2)),
      };

      // Check if identical to original
      const isIdentical =
        updatedCurrent.promoRate === existing.original.promoRate &&
        updatedCurrent.promoMonths === existing.original.promoMonths &&
        updatedCurrent.floatingRate === existing.original.floatingRate &&
        updatedCurrent.earlyFeePercent === existing.original.earlyFeePercent;

      if (isIdentical) {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      return {
        ...prev,
        [key]: {
          ...existing,
          current: updatedCurrent,
        },
      };
    });
  };

  // Revert all edits
  const handleRevertAll = () => {
    if (activeSection === 'DEPOSIT') {
      setModifiedDepositCells({});
    } else {
      setModifiedLoanCells({});
    }
    setAlertBanner({
      type: 'info',
      message: 'Đã hủy bỏ toàn bộ thay đổi chưa lưu trong tab hiện tại.',
    });
  };

  // Save modified cells via POST /api/cron/update-rates
  const handleSave = async () => {
    setIsSaving(true);
    setAlertBanner(null);

    try {
      if (activeSection === 'DEPOSIT') {
        const modifiedList = Object.values(modifiedDepositCells);
        if (modifiedList.length === 0) return;

        const updates = modifiedList.map(item => ({
          bank_id: item.bankId,
          deposit_type: item.depositType,
          term_months: item.termMonths,
          rate_percent: item.newRate,
        }));

        const res = await fetch('/api/cron/update-rates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify({ updates }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu dữ liệu tiền gửi');

        setRatesMap(prev => {
          const updated = { ...prev };
          modifiedList.forEach(item => {
            const key = `${item.bankId}_${item.depositType}_${item.termMonths}`;
            updated[key] = item.newRate;
          });
          return updated;
        });

        setModifiedDepositCells({});
        setAlertBanner({
          type: 'success',
          message: `Đã lưu thành công ${data.count} ô lãi suất tiền gửi vào Supabase & rate_history!`,
        });
      } else {
        // Loan updates
        const modifiedList = Object.values(modifiedLoanCells);
        if (modifiedList.length === 0) return;

        const loanUpdates = modifiedList.map(item => ({
          bank_id: item.bankId,
          loan_type: item.category,
          promo_rate: item.current.promoRate,
          promo_months: item.current.promoMonths,
          floating_rate: item.current.floatingRate,
          early_fee_percent: item.current.earlyFeePercent,
        }));

        const res = await fetch('/api/cron/update-rates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify({ loanUpdates }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu dữ liệu lãi vay');

        setLoanRatesMap(prev => {
          const updated = { ...prev };
          modifiedList.forEach(item => {
            const key = `${item.bankId}_${item.category}`;
            updated[key] = { ...item.current };
          });
          return updated;
        });

        setModifiedLoanCells({});
        setAlertBanner({
          type: 'success',
          message: `Đã lưu thành công ${data.count} gói lãi suất cho vay vào bảng loan_rates!`,
        });
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setAlertBanner({
        type: 'error',
        message: err.message || 'Không thể cập nhật lãi suất.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Run scraper on demand via GET /api/cron/update-rates
  const handleRunScraperNow = async () => {
    if (!confirm('Bạn có chắc chắn muốn cào và đồng bộ lãi suất mới nhất từ WebGia ngay bây giờ?')) {
      return;
    }

    setIsSyncing(true);
    setAlertBanner(null);

    try {
      const res = await fetch('/api/cron/update-rates', {
        method: 'GET',
        headers: {
          'x-admin-password': password,
          Authorization: `Bearer ${password}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Cào dữ liệu thất bại');
      }

      setAlertBanner({
        type: 'success',
        message: `Đồng bộ thành công ${data.updatedCount} bản ghi từ WebGia lúc ${new Date(
          data.timestamp
        ).toLocaleTimeString('vi-VN')}!`,
      });

      await fetchData();
    } catch (err: any) {
      console.error('Scraper error:', err);
      setAlertBanner({
        type: 'error',
        message: 'Lỗi cào dữ liệu tự động: ' + (err.message || 'Thất bại'),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const modifiedDepositCount = Object.keys(modifiedDepositCells).length;
  const modifiedLoanCount = Object.keys(modifiedLoanCells).length;
  const currentModifiedCount = activeSection === 'DEPOSIT' ? modifiedDepositCount : modifiedLoanCount;

  // Sorted list of banks
  const sortedBanks = useMemo(() => {
    return [...banks].sort((a, b) => a.code.localeCompare(b.code));
  }, [banks]);

  // Loading spinner during initial session verification
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs">Đang kiểm tra phiên quản trị...</span>
        </div>
      </div>
    );
  }

  // If locked, render Password Prompt Screen with Server-Side Validation
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Khu Vực Quản Trị Viên
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nhập mã bảo mật quản trị (`ADMIN_SECRET`) để truy cập ma trận quản lý và cập nhật biểu lãi suất Tiền gửi & Cho vay của 14 ngân hàng.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Mật khẩu quản trị
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập ADMIN_SECRET..."
                  disabled={isVerifying}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                  autoFocus
                />
              </div>
              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 mt-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực với máy chủ...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Xác thực & Mở khóa Ma Trận</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Về trang tính lãi</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700/80"
              title="Quay về trang tính toán lãi suất"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Về trang tính lãi</span>
            </Link>

            <div className="flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-emerald-400" />
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Quản Trị Ma Trận Lãi Suất
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Admin Mode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRunScraperNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              title="Cào và đồng bộ tự động từ WebGia ngay bây giờ"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : 'Cào WebGia tự động'}</span>
              <span className="sm:hidden">{isSyncing ? 'Đồng bộ...' : 'Cào WebGia'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              title="Đăng xuất khỏi phiên quản trị"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 flex-1">
        {/* Alert Banner */}
        {alertBanner && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm ${
              alertBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : alertBanner.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertBanner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{alertBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlertBanner(null)}
              className="text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Segmented Mode Switcher: TIỀN GỬI vs CHO VAY */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-sm max-w-xl">
          <button
            type="button"
            onClick={() => setActiveSection('DEPOSIT')}
            className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSection === 'DEPOSIT'
                ? 'bg-white text-emerald-700 shadow-md border border-slate-200/80 ring-1 ring-emerald-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>1. Lãi suất Tiền gửi (Tiết kiệm)</span>
            {modifiedDepositCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                {modifiedDepositCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('LOAN')}
            className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSection === 'LOAN'
                ? 'bg-white text-blue-700 shadow-md border border-slate-200/80 ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <HandCoins className="w-4 h-4 text-blue-600" />
            <span>2. Lãi suất Cho vay (Vay vốn)</span>
            {modifiedLoanCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                {modifiedLoanCount}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="bg-white rounded-3xl p-5 shadow-fintech border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sub Filters depending on Active Section */}
          {activeSection === 'DEPOSIT' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Kênh gửi:
              </span>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setActiveChannel('ONLINE')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeChannel === 'ONLINE'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gửi Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel('COUNTER')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeChannel === 'COUNTER'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gửi tại quầy</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Gói vay:
              </span>
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/70 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveLoanCategory('MORTGAGE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeLoanCategory === 'MORTGAGE'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mua nhà</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLoanCategory('AUTO')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeLoanCategory === 'AUTO'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mua ô tô</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLoanCategory('UNSECURED')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeLoanCategory === 'UNSECURED'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tín chấp</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Tải lại</span>
            </button>

            {currentModifiedCount > 0 && (
              <button
                type="button"
                onClick={handleRevertAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium border border-slate-200 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hủy sửa ({currentModifiedCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={currentModifiedCount === 0 || isSaving}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                currentModifiedCount > 0
                  ? activeSection === 'DEPOSIT'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
              <span>
                {isSaving ? 'Đang lưu...' : `Lưu thay đổi (${currentModifiedCount})`}
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 1: DEPOSIT SPREADSHEET TABLE */}
        {activeSection === 'DEPOSIT' && (
          <div className="bg-white rounded-3xl shadow-fintech border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Đang chỉnh sửa biểu lãi suất{' '}
                <strong className="text-slate-900 font-bold">
                  {activeChannel === 'ONLINE' ? 'Trực tuyến (Online)' : 'Tại quầy giao dịch (Counter)'}
                </strong>{' '}
                cho 14 ngân hàng.
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-400 inline-block" />
                  <span className="text-slate-600">Ô đã sửa</span>
                </span>
                <span className="text-slate-300">|</span>
                <span>Bước chỉnh: 0.05%/năm</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Ngân hàng</th>
                    <th className="py-3.5 px-3 w-20 text-center">Mã</th>
                    {TERMS.map(term => (
                      <th key={term} className="py-3.5 px-3 text-center min-w-[95px]">
                        {term} tháng
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedBanks.map((bank, index) => {
                    return (
                      <tr
                        key={bank.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Index */}
                        <td className="py-3 px-4 text-center text-xs text-slate-400 font-medium">
                          {index + 1}
                        </td>

                        {/* Bank Identification */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: bank.brandColor || '#64748b' }}
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate">
                                {bank.shortName}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {bank.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Code Badge */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-slate-100 text-slate-700">
                            {bank.code}
                          </span>
                        </td>

                        {/* Editable Term Cells */}
                        {TERMS.map(term => {
                          const cellKey = `${bank.id}_${activeChannel}_${term}`;
                          const currentRate = ratesMap[cellKey] ?? 0;
                          const isModified = Boolean(modifiedDepositCells[cellKey]);
                          const displayVal = isModified
                            ? modifiedDepositCells[cellKey].newRate
                            : currentRate;

                          return (
                            <td key={term} className="py-2.5 px-2 text-center">
                              <div className="relative inline-block w-full max-w-[85px]">
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0"
                                  max="20"
                                  value={displayVal === 0 ? '' : displayVal}
                                  placeholder="0.00"
                                  onChange={e =>
                                    handleDepositRateChange(
                                      bank.id,
                                      activeChannel,
                                      term,
                                      e.target.value
                                    )
                                  }
                                  className={`w-full py-1.5 px-2 text-center text-xs font-bold rounded-xl border tabular-nums transition-all outline-none focus:ring-2 focus:ring-emerald-500 ${
                                    isModified
                                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold shadow-sm ring-1 ring-amber-400/50'
                                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                                {isModified && (
                                  <span
                                    className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"
                                    title={`Gốc: ${modifiedDepositCells[cellKey].originalRate}%`}
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Thao tác lưu sẽ cập nhật bảng <code>deposit_rates</code> và tự động ghi nhận vào <code>rate_history</code>.
                </span>
              </div>
              {modifiedDepositCount > 0 && (
                <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                  Đang có {modifiedDepositCount} thay đổi tiền gửi chưa lưu
                </span>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: LOAN SPREADSHEET TABLE */}
        {activeSection === 'LOAN' && (
          <div className="bg-white rounded-3xl shadow-fintech border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Đang chỉnh sửa gói lãi suất vay{' '}
                <strong className="text-blue-900 font-bold">
                  {activeLoanCategory === 'MORTGAGE'
                    ? 'Mua nhà / Thế chấp'
                    : activeLoanCategory === 'AUTO'
                    ? 'Mua ô tô'
                    : 'Tín chấp tiêu dùng'}
                </strong>{' '}
                cho 14 ngân hàng.
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-400 inline-block" />
                  <span className="text-slate-600">Ô đã sửa</span>
                </span>
                <span className="text-slate-300">|</span>
                <span>Bước chỉnh: 0.05%/năm</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Ngân hàng</th>
                    <th className="py-3.5 px-3 w-20 text-center">Mã</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">LS Ưu đãi (%/năm)</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">Kỳ ưu đãi (tháng)</th>
                    <th className="py-3.5 px-3 text-center min-w-[140px]">LS Thả nổi (%/năm)</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">Phí phạt trước hạn (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedBanks.map((bank, index) => {
                    const key = `${bank.id}_${activeLoanCategory}`;
                    const originalData = loanRatesMap[key] || {
                      promoRate: 6.5,
                      promoMonths: 12,
                      floatingRate: 10.5,
                      earlyFeePercent: 1.5,
                    };
                    const modifiedItem = modifiedLoanCells[key];
                    const currentData = modifiedItem ? modifiedItem.current : originalData;
                    const isRowModified = Boolean(modifiedItem);

                    return (
                      <tr
                        key={bank.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isRowModified ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Index */}
                        <td className="py-3 px-4 text-center text-xs text-slate-400 font-medium">
                          {index + 1}
                        </td>

                        {/* Bank Identification */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: bank.brandColor || '#64748b' }}
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate">
                                {bank.shortName}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {bank.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Code Badge */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-slate-100 text-slate-700">
                            {bank.code}
                          </span>
                        </td>

                        {/* Promo Rate */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="relative inline-block w-full max-w-[110px]">
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              max="30"
                              value={currentData.promoRate === 0 ? '' : currentData.promoRate}
                              onChange={e =>
                                handleLoanFieldChange(
                                  bank.id,
                                  activeLoanCategory,
                                  'promoRate',
                                  e.target.value
                                )
                              }
                              className={`w-full py-1.5 px-2.5 text-center text-xs font-bold rounded-xl border tabular-nums transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                                isRowModified && currentData.promoRate !== originalData.promoRate
                                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold shadow-sm ring-1 ring-amber-400/50'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                              }`}
                            />
                          </div>
                        </td>

                        {/* Promo Months */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="relative inline-block w-full max-w-[100px]">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="120"
                              value={currentData.promoMonths}
                              onChange={e =>
                                handleLoanFieldChange(
                                  bank.id,
                                  activeLoanCategory,
                                  'promoMonths',
                                  e.target.value
                                )
                              }
                              className={`w-full py-1.5 px-2.5 text-center text-xs font-bold rounded-xl border tabular-nums transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                                isRowModified && currentData.promoMonths !== originalData.promoMonths
                                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold shadow-sm ring-1 ring-amber-400/50'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                              }`}
                            />
                          </div>
                        </td>

                        {/* Floating Rate */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="relative inline-block w-full max-w-[110px]">
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              max="30"
                              value={currentData.floatingRate === 0 ? '' : currentData.floatingRate}
                              onChange={e =>
                                handleLoanFieldChange(
                                  bank.id,
                                  activeLoanCategory,
                                  'floatingRate',
                                  e.target.value
                                )
                              }
                              className={`w-full py-1.5 px-2.5 text-center text-xs font-bold rounded-xl border tabular-nums transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                                isRowModified && currentData.floatingRate !== originalData.floatingRate
                                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold shadow-sm ring-1 ring-amber-400/50'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                              }`}
                            />
                          </div>
                        </td>

                        {/* Early Repayment Fee */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="relative inline-block w-full max-w-[100px]">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={currentData.earlyFeePercent}
                              onChange={e =>
                                handleLoanFieldChange(
                                  bank.id,
                                  activeLoanCategory,
                                  'earlyFeePercent',
                                  e.target.value
                                )
                              }
                              className={`w-full py-1.5 px-2.5 text-center text-xs font-bold rounded-xl border tabular-nums transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                                isRowModified && currentData.earlyFeePercent !== originalData.earlyFeePercent
                                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold shadow-sm ring-1 ring-amber-400/50'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>
                  Thao tác lưu sẽ cập nhật bảng <code>loan_rates</code> trong Supabase cho danh mục{' '}
                  <strong>{activeLoanCategory}</strong>.
                </span>
              </div>
              {modifiedLoanCount > 0 && (
                <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                  Đang có {modifiedLoanCount} thay đổi lãi vay chưa lưu
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
