'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LoanCalculatorState,
  LoanCalculationResult,
  BankGroup,
} from '@/types';
import { getBanksAndLoanRates, FetchLoanRatesResponse } from '@/lib/loanService';
import { calculateAllLoanRankings } from '@/lib/loanCalculator';
import { LoanControl } from './LoanControl';
import { LoanHeroHighlight } from './LoanHeroHighlight';
import { LoanPaymentChart } from './LoanPaymentChart';
import { LoanRankingTable } from './LoanRankingTable';
import { LoanAmortizationModal } from './LoanAmortizationModal';
import { LoanEducationalGuide } from './LoanEducationalGuide';
import { formatVND } from '@/lib/formatters';
import { Landmark, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const LoanCalculator: React.FC = () => {
  // Loan calculator state
  const [loanState, setLoanState] = useState<LoanCalculatorState>({
    category: 'MORTGAGE',
    amount: 1_000_000_000,
    termMonths: 60,
    method: 'PACKAGE',
    groupFilter: 'ALL',
    sortOrder: 'asc',
  });

  // Rates response state
  const [ratesResponse, setRatesResponse] = useState<FetchLoanRatesResponse>({
    data: [],
    source: 'LOCAL_FALLBACK',
    lastUpdated: 'Thị trường vay tiêu dùng & thế chấp 2025',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal state
  const [selectedBankForModal, setSelectedBankForModal] = useState<LoanCalculationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch rates when category or group filter changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getBanksAndLoanRates(loanState.category, loanState.groupFilter).then(res => {
      if (isMounted) {
        setRatesResponse(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loanState.category, loanState.groupFilter]);

  // Compute live loan rankings
  const rankings: LoanCalculationResult[] = useMemo(() => {
    if (!ratesResponse.data || ratesResponse.data.length === 0) return [];

    return calculateAllLoanRankings(
      ratesResponse.data,
      loanState.amount,
      loanState.termMonths,
      loanState.method,
      loanState.sortOrder
    );
  }, [ratesResponse.data, loanState]);

  // Find lowest and highest cost packages
  const lowestBank = useMemo(() => {
    if (rankings.length === 0) return null;
    return [...rankings].sort((a, b) => a.totalInterest - b.totalInterest)[0];
  }, [rankings]);

  const highestBank = useMemo(() => {
    if (rankings.length === 0) return null;
    return [...rankings].sort((a, b) => b.totalInterest - a.totalInterest)[0];
  }, [rankings]);

  const handleStateChange = (updates: Partial<LoanCalculatorState>) => {
    setLoanState(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const handleOpenSchedule = (bankResult: LoanCalculationResult) => {
    setSelectedBankForModal(bankResult);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Input Controls & Hero Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Loan Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          <LoanControl
            state={loanState}
            onChange={handleStateChange}
          />
        </div>

        {/* Right Column: Hero Highlight Cards & Payment Variation Chart */}
        <div className="lg:col-span-7 space-y-6">
          <LoanHeroHighlight
            lowestBank={lowestBank}
            highestBank={highestBank}
            category={loanState.category}
            termMonths={loanState.termMonths}
            onOpenSchedule={handleOpenSchedule}
          />

          <LoanPaymentChart
            rankings={rankings}
            lowestBank={lowestBank}
            highestBank={highestBank}
          />
        </div>
      </div>

      {/* Full Bank Loan Ranking Table */}
      <section id="bang-so-sanh-vay">
        <LoanRankingTable
          rankings={rankings}
          category={loanState.category}
          principal={loanState.amount}
          termMonths={loanState.termMonths}
          onOpenSchedule={handleOpenSchedule}
        />
      </section>

      {/* Educational Guide for Borrowers */}
      <section id="cam-nang-vay">
        <LoanEducationalGuide />
      </section>

      {/* Amortization Schedule Modal */}
      <LoanAmortizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={selectedBankForModal}
      />

      {/* Floating Bottom Bar on Mobile */}
      {lowestBank && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 px-4 py-3 text-white flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
              style={{ backgroundColor: lowestBank.bank.brandColor || '#10b981' }}
            >
              {lowestBank.bank.code}
            </div>
            <div>
              <div className="text-[11px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Gói tốt nhất: {lowestBank.bank.shortName}</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">
                Trả tháng đầu: <strong className="text-emerald-400 font-bold">{formatVND(lowestBank.firstMonthPayment)}</strong>
              </div>
            </div>
          </div>

          <a
            href="#bang-so-sanh-vay"
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
