'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  SavingsCalculatorState,
  CalculationResult,
} from '@/types';
import { getBanksAndRates, FetchRatesResponse } from '@/lib/rateService';
import { calculateAllBankRankings } from '@/lib/interestCalculator';
import { CalculatorControl } from '@/components/CalculatorControl';
import { BestBankHighlight } from '@/components/BestBankHighlight';
import { GrowthChart } from '@/components/GrowthChart';
import { BankComparisonTable } from '@/components/BankComparisonTable';
import { SideBySideModal } from '@/components/SideBySideModal';
import { EarlyWithdrawalModal } from '@/components/EarlyWithdrawalModal';
import { EducationalGuide } from '@/components/EducationalGuide';
import { formatVND } from '@/lib/formatters';
import { Crown, ArrowUpRight } from 'lucide-react';

interface SavingsCalculatorProps {
  onStatsComputed?: (stats: {
    results: CalculationResult[];
    lastUpdated: string;
    source: 'SUPABASE' | 'LOCAL_FALLBACK';
  }) => void;
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ onStatsComputed }) => {
  // Calculator state
  const [calculatorState, setCalculatorState] = useState<SavingsCalculatorState>({
    mode: 'MONTHLY',
    amount: 3_000_000,
    termMonths: 12,
    depositType: 'ONLINE',
    groupFilter: 'ALL',
    enableCompound: false,
    compoundCycles: 2,
    selectedCompareBankIds: [],
  });

  // Rates response state
  const [ratesResponse, setRatesResponse] = useState<FetchRatesResponse>({
    data: [],
    source: 'LOCAL_FALLBACK',
    lastUpdated: '15/01/2025 (Dữ liệu thị trường niêm yết)',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isSideBySideOpen, setIsSideBySideOpen] = useState<boolean>(false);
  const [isEarlyWithdrawalOpen, setIsEarlyWithdrawalOpen] = useState<boolean>(false);

  // Fetch rates whenever term, deposit channel, or group filter changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getBanksAndRates(
      calculatorState.termMonths,
      calculatorState.depositType,
      calculatorState.groupFilter
    ).then(res => {
      if (isMounted) {
        setRatesResponse(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    calculatorState.termMonths,
    calculatorState.depositType,
    calculatorState.groupFilter,
  ]);

  // Compute live rankings
  const rankings: CalculationResult[] = useMemo(() => {
    if (!ratesResponse.data || ratesResponse.data.length === 0) return [];

    return calculateAllBankRankings(
      ratesResponse.data,
      calculatorState.mode,
      calculatorState.amount,
      calculatorState.termMonths,
      calculatorState.enableCompound,
      calculatorState.compoundCycles
    );
  }, [ratesResponse.data, calculatorState]);

  const topBank = rankings.length > 0 ? rankings[0] : null;

  // Selected banks for comparison modal
  const selectedBanksForCompare = useMemo(() => {
    return rankings.filter(r =>
      calculatorState.selectedCompareBankIds.includes(r.bank.id)
    );
  }, [rankings, calculatorState.selectedCompareBankIds]);

  // Notify parent of updated statistics if callback provided
  useEffect(() => {
    if (onStatsComputed) {
      onStatsComputed({
        results: rankings,
        lastUpdated: ratesResponse.lastUpdated,
        source: ratesResponse.source,
      });
    }
  }, [rankings, ratesResponse, onStatsComputed]);

  const handleStateChange = (updates: Partial<SavingsCalculatorState>) => {
    setCalculatorState(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const handleToggleCompare = (bankId: string) => {
    setCalculatorState(prev => {
      const exists = prev.selectedCompareBankIds.includes(bankId);
      if (exists) {
        return {
          ...prev,
          selectedCompareBankIds: prev.selectedCompareBankIds.filter(id => id !== bankId),
        };
      }
      if (prev.selectedCompareBankIds.length >= 3) {
        return prev;
      }
      return {
        ...prev,
        selectedCompareBankIds: [...prev.selectedCompareBankIds, bankId],
      };
    });
  };

  const handleOpenCompareWithBank = (bankId: string) => {
    if (!calculatorState.selectedCompareBankIds.includes(bankId)) {
      setCalculatorState(prev => ({
        ...prev,
        selectedCompareBankIds:
          prev.selectedCompareBankIds.length >= 3
            ? [bankId]
            : [...prev.selectedCompareBankIds, bankId],
      }));
    }
    setIsSideBySideOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Section 2 & 3: Interactive Calculator (Left) and Hero Winner + Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calculator Controls */}
        <div className="lg:col-span-5 space-y-6">
          <CalculatorControl
            state={calculatorState}
            onChange={handleStateChange}
            onOpenEarlyWithdrawal={() => setIsEarlyWithdrawalOpen(true)}
          />
        </div>

        {/* Right Column: Hero Winner Card & Growth Visualizer */}
        <div className="lg:col-span-7 space-y-6">
          <BestBankHighlight
            topBank={topBank}
            mode={calculatorState.mode}
            termMonths={calculatorState.termMonths}
            onOpenCompare={handleOpenCompareWithBank}
          />

          <GrowthChart
            results={rankings}
            selectedBankId={topBank?.bank.id}
          />
        </div>
      </div>

      {/* Section 4: Full Bank Ranking & Comparison Table */}
      <section id="bang-so-sanh">
        <BankComparisonTable
          results={rankings}
          mode={calculatorState.mode}
          termMonths={calculatorState.termMonths}
          depositType={calculatorState.depositType}
          amount={calculatorState.amount}
          selectedCompareIds={calculatorState.selectedCompareBankIds}
          onToggleCompare={handleToggleCompare}
          onOpenSideBySideModal={() => setIsSideBySideOpen(true)}
        />
      </section>

      {/* Section 5: Educational Financial Guide & FAQs */}
      <section id="cam-nang">
        <EducationalGuide />
      </section>

      {/* Side-by-Side Comparison Modal */}
      <SideBySideModal
        isOpen={isSideBySideOpen}
        onClose={() => setIsSideBySideOpen(false)}
        selectedBanks={selectedBanksForCompare}
        mode={calculatorState.mode}
        termMonths={calculatorState.termMonths}
        depositType={calculatorState.depositType}
        amount={calculatorState.amount}
      />

      {/* Mode C: Early Withdrawal Modal */}
      <EarlyWithdrawalModal
        isOpen={isEarlyWithdrawalOpen}
        onClose={() => setIsEarlyWithdrawalOpen(false)}
        principal={topBank ? topBank.totalPrincipal : calculatorState.amount}
        termMonths={calculatorState.termMonths}
        topBank={topBank}
      />

      {/* Floating Bottom Bar on Mobile */}
      {topBank && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 px-4 py-3 text-white flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
              style={{ backgroundColor: topBank.bank.brandColor || '#10b981' }}
            >
              {topBank.bank.code}
            </div>
            <div>
              <div className="text-[11px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Top 1: {topBank.bank.shortName}</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">
                Lãi nhận: <strong className="text-emerald-400 font-bold">+{formatVND(topBank.totalInterest)}</strong>
              </div>
            </div>
          </div>

          <a
            href="#bang-so-sanh"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
          >
            <span>So sánh</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
