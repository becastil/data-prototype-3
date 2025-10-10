'use client';

/**
 * Monthly Detail - Individual Plan View
 * Dynamic route for plan-specific detail pages
 * Matches template pages 5-7 (HDHP, PPO Base, PPO Buy-Up)
 *
 * Features:
 * - Filtered view showing only selected plan's data
 * - Same columns A-N structure as All Plans
 * - Plan-specific PEPM calculations
 * - Tab navigation to switch between plans
 * - Rolling 24-month view
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MonthlyDetailTable } from '../all/components/MonthlyDetailTable';
import { PEPMTrendCharts } from '../all/components/PEPMTrendCharts';
import { PlanNavigationTabs } from './components/PlanNavigationTabs';
import type { MonthlyPlanStats, PEPMCalculation, Plan } from '@/types/enterprise-template';
import { calculateMonthlyStats, calculatePEPM } from '@/lib/calculations/template-formulas';

// Plan type mapping
const PLAN_INFO: Record<string, { name: string; type: string }> = {
  'hdhp': { name: 'HDHP', type: 'HDHP' },
  'ppo-base': { name: 'PPO Base', type: 'PPO_BASE' },
  'ppo-buyup': { name: 'PPO Buy-Up', type: 'PPO_BUYUP' },
};

export default function MonthlyPlanDetailPage() {
  const params = useParams();
  const planSlug = params.plan as string;

  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyPlanStats[]>([]);
  const [pepmCalculations, setPepmCalculations] = useState<{
    currentPY: PEPMCalculation | null;
    priorPY: PEPMCalculation | null;
    current12: PEPMCalculation | null;
    prior12: PEPMCalculation | null;
  }>({ currentPY: null, priorPY: null, current12: null, prior12: null });

  // Filters
  const [months, setMonths] = useState<number>(24);
  const [selectedClient, setSelectedClient] = useState('flavio-dog-house');
  const [selectedPlanYear, setSelectedPlanYear] = useState('2024');

  const planInfo = PLAN_INFO[planSlug];

  useEffect(() => {
    if (planInfo) {
      loadPlanData();
    }
  }, [selectedClient, selectedPlanYear, months, planSlug]);

  async function loadPlanData() {
    try {
      setLoading(true);

      // In production: GET /api/monthly/plan?clientId&planYearId&planId&months=24
      // For now, use mock data filtered by plan

      // Mock data for each plan (proportional to All Plans data)
      const planMockData = generatePlanMockData(planSlug);

      // Calculate complete stats for each month
      const calculatedData = planMockData.map(m => calculateMonthlyStats(m));
      setMonthlyData(calculatedData);

      // Calculate PEPM for different periods
      const priorPYData = calculatedData.slice(0, 12);
      const currentPYData = calculatedData.slice(12, 24);
      const current12Data = calculatedData.slice(-12);
      const prior12Data = calculatedData.slice(0, 12);

      setPepmCalculations({
        currentPY: calculatePEPM(currentPYData, `${planInfo.name} Current PY`),
        priorPY: calculatePEPM(priorPYData, `${planInfo.name} Prior PY`),
        current12: calculatePEPM(current12Data, `${planInfo.name} Current 12`),
        prior12: calculatePEPM(prior12Data, `${planInfo.name} Prior 12`),
      });

    } catch (err) {
      console.error('Failed to load plan data:', err);
    } finally {
      setLoading(false);
    }
  }

  function generatePlanMockData(plan: string): Partial<MonthlyPlanStats>[] {
    // Plan distribution: HDHP 3%, PPO Base 58%, PPO Buy-Up 39%
    const distribution = plan === 'hdhp' ? 0.03 : plan === 'ppo-base' ? 0.58 : 0.39;

    // Base All Plans data (from all/page.tsx)
    const allPlansData = [
      // Jul 2023 - Jun 2024 (Prior PY)
      { totalSubscribers: 449, medicalClaims: 150727, pharmacyClaims: 30212, specStopLossReimb: 0, estimatedRxRebates: -33675, adminFees: 19904, stopLossFees: 55218, budgetedPremium: 382709 },
      { totalSubscribers: 448, medicalClaims: 88827, pharmacyClaims: 31059, specStopLossReimb: 0, estimatedRxRebates: -33600, adminFees: 19860, stopLossFees: 55134, budgetedPremium: 382142 },
      { totalSubscribers: 444, medicalClaims: 413648, pharmacyClaims: 48424, specStopLossReimb: 0, estimatedRxRebates: -33300, adminFees: 19683, stopLossFees: 55143, budgetedPremium: 382314 },
      { totalSubscribers: 446, medicalClaims: 247666, pharmacyClaims: 30880, specStopLossReimb: 0, estimatedRxRebates: -33450, adminFees: 19771, stopLossFees: 55310, budgetedPremium: 383377 },
      { totalSubscribers: 449, medicalClaims: 466867, pharmacyClaims: 40030, specStopLossReimb: 0, estimatedRxRebates: -33675, adminFees: 19904, stopLossFees: 55908, budgetedPremium: 387444 },
      { totalSubscribers: 455, medicalClaims: 190769, pharmacyClaims: 35543, specStopLossReimb: 0, estimatedRxRebates: -34125, adminFees: 20170, stopLossFees: 56739, budgetedPremium: 393727 },
      { totalSubscribers: 453, medicalClaims: 421311, pharmacyClaims: 56671, specStopLossReimb: 0, estimatedRxRebates: -33975, adminFees: 20081, stopLossFees: 56808, budgetedPremium: 394626 },
      { totalSubscribers: 446, medicalClaims: 309247, pharmacyClaims: 47683, specStopLossReimb: 0, estimatedRxRebates: -33450, adminFees: 19771, stopLossFees: 56038, budgetedPremium: 389539 },
      { totalSubscribers: 445, medicalClaims: 299012, pharmacyClaims: 51426, specStopLossReimb: 0, estimatedRxRebates: -33375, adminFees: 19727, stopLossFees: 55753, budgetedPremium: 387107 },
      { totalSubscribers: 454, medicalClaims: 192188, pharmacyClaims: 53262, specStopLossReimb: 0, estimatedRxRebates: -34050, adminFees: 20126, stopLossFees: 56561, budgetedPremium: 392306 },
      { totalSubscribers: 453, medicalClaims: 782742, pharmacyClaims: 48369, specStopLossReimb: 0, estimatedRxRebates: -33975, adminFees: 20081, stopLossFees: 56310, budgetedPremium: 390357 },
      { totalSubscribers: 442, medicalClaims: 523731, pharmacyClaims: 45825, specStopLossReimb: 0, estimatedRxRebates: -33150, adminFees: 19594, stopLossFees: 55245, budgetedPremium: 383284 },
      // Jul 2024 - Jun 2025 (Current PY)
      { totalSubscribers: 483, medicalClaims: 261827, pharmacyClaims: 59708, specStopLossReimb: 0, estimatedRxRebates: -36225, adminFees: 22136, stopLossFees: 69101, budgetedPremium: 471493 },
      { totalSubscribers: 481, medicalClaims: 173841, pharmacyClaims: 49520, specStopLossReimb: 0, estimatedRxRebates: -36075, adminFees: 22044, stopLossFees: 69079, budgetedPremium: 471930 },
      { totalSubscribers: 479, medicalClaims: 339246, pharmacyClaims: 47644, specStopLossReimb: 0, estimatedRxRebates: -35925, adminFees: 21953, stopLossFees: 68687, budgetedPremium: 468778 },
      { totalSubscribers: 477, medicalClaims: 319071, pharmacyClaims: 64891, specStopLossReimb: 0, estimatedRxRebates: -35775, adminFees: 21861, stopLossFees: 68360, budgetedPremium: 466259 },
      { totalSubscribers: 476, medicalClaims: 712326, pharmacyClaims: 58257, specStopLossReimb: -397928, estimatedRxRebates: -35700, adminFees: 21815, stopLossFees: 68629, budgetedPremium: 468545 },
      { totalSubscribers: 469, medicalClaims: 240732, pharmacyClaims: 61659, specStopLossReimb: -48535, estimatedRxRebates: -35175, adminFees: 21494, stopLossFees: 68121, budgetedPremium: 465632 },
      { totalSubscribers: 461, medicalClaims: 212771, pharmacyClaims: 58005, specStopLossReimb: -3572, estimatedRxRebates: -34575, adminFees: 21128, stopLossFees: 67258, budgetedPremium: 459615 },
      { totalSubscribers: 454, medicalClaims: 268914, pharmacyClaims: 49033, specStopLossReimb: -7756, estimatedRxRebates: -34050, adminFees: 20807, stopLossFees: 66466, budgetedPremium: 454291 },
      { totalSubscribers: 461, medicalClaims: 316992, pharmacyClaims: 55837, specStopLossReimb: -28284, estimatedRxRebates: -34575, adminFees: 21128, stopLossFees: 67556, budgetedPremium: 461685 },
      { totalSubscribers: 467, medicalClaims: 363614, pharmacyClaims: 59972, specStopLossReimb: -33654, estimatedRxRebates: -35025, adminFees: 21403, stopLossFees: 67755, budgetedPremium: 462164 },
      { totalSubscribers: 467, medicalClaims: 683702, pharmacyClaims: 55997, specStopLossReimb: -3214, estimatedRxRebates: -35025, adminFees: 21403, stopLossFees: 67973, budgetedPremium: 464244 },
      { totalSubscribers: 474, medicalClaims: 606934, pharmacyClaims: 57999, specStopLossReimb: -40568, estimatedRxRebates: -35550, adminFees: 21723, stopLossFees: 68998, budgetedPremium: 471015 },
    ];

    // Apply distribution to get plan-specific data
    return allPlansData.map((month, index) => ({
      id: `${plan}-${index + 1}`,
      monthSnapshotId: `m${index + 1}`,
      planId: plan,
      totalSubscribers: Math.round(month.totalSubscribers * distribution),
      medicalClaims: Math.round(month.medicalClaims * distribution),
      pharmacyClaims: Math.round(month.pharmacyClaims * distribution),
      specStopLossReimb: Math.round(month.specStopLossReimb * distribution),
      estimatedRxRebates: Math.round(month.estimatedRxRebates * distribution),
      adminFees: Math.round(month.adminFees * distribution),
      stopLossFees: Math.round(month.stopLossFees * distribution),
      budgetedPremium: Math.round(month.budgetedPremium * distribution),
    }));
  }

  function handleExportCSV() {
    // In production: POST /api/export/monthly/csv
    console.log(`Exporting ${planInfo.name} CSV...`);
  }

  if (!planInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Invalid Plan</h2>
          <p className="text-red-700">
            Plan &quot;{planSlug}&quot; not found. Valid plans: hdhp, ppo-base, ppo-buyup
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {planInfo.name} detail...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Monthly Detail - {planInfo.name}
        </h1>
        <p className="text-gray-600">
          Rolling 24 Months - Claims Paid through June 2025
        </p>
      </div>

      {/* Plan Navigation Tabs */}
      <PlanNavigationTabs activePlan={planSlug} />

      {/* Filters & Actions */}
      <div className="mb-6 flex gap-4 items-end justify-between">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="flavio-dog-house">Flavio&apos;s Dog House</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Year
            </label>
            <select
              value={selectedPlanYear}
              onChange={(e) => setSelectedPlanYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2024">2024 Plan Year</option>
              <option value="2023">2023 Plan Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Months
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
              <option value={36}>36 Months</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Monthly Detail Table */}
      <div className="mb-8">
        <MonthlyDetailTable
          data={monthlyData}
          pepmCalculations={pepmCalculations}
        />
      </div>

      {/* PEPM Trend Charts */}
      <div>
        <PEPMTrendCharts
          data={monthlyData}
          current12={pepmCalculations.current12}
          prior12={pepmCalculations.prior12}
        />
      </div>
    </div>
  );
}
