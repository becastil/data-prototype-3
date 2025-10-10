'use client';

/**
 * Executive Summary Dashboard
 * Matches "Medical-Rx Experience Report Template" Page 2
 *
 * Features:
 * - Fuel Gauge (% of Budget with color thresholds)
 * - KPI Tiles (all Plan YTD metrics)
 * - Plan YTD Stacked Chart
 * - Distribution Insights (Med/Rx, Plan Mix, HCC Buckets)
 * - Observations Panel
 */

import React, { useState, useEffect } from 'react';
import { FuelGauge } from './components/FuelGauge';
import { KPITiles } from './components/KPITiles';
import { PlanYTDChart } from './components/PlanYTDChart';
import { DistributionPanels } from './components/DistributionPanels';
import { ObservationsPanel } from './components/ObservationsPanel';
import type { ExecutiveSummaryKPIs, FuelGaugeConfig, DistributionInsights } from '@/types/enterprise-template';
import { calculateFuelGauge } from '@/lib/calculations/template-formulas';
import { generateExecutiveSummaryPDF } from '@/lib/pdf/executiveSummaryPDF';

export default function ExecutiveDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<ExecutiveSummaryKPIs | null>(null);
  const [fuelGauge, setFuelGauge] = useState<FuelGaugeConfig | null>(null);
  const [distributionInsights, setDistributionInsights] = useState<DistributionInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedClient, setSelectedClient] = useState<string>('flavio-dog-house');
  const [selectedPlanYear, setSelectedPlanYear] = useState<string>('2024');
  const [throughMonth, setThroughMonth] = useState<string>('2025-06');

  useEffect(() => {
    loadExecutiveSummary();
  }, [selectedClient, selectedPlanYear, throughMonth]);

  async function loadExecutiveSummary() {
    try {
      setLoading(true);
      setError(null);

      // In production, this would call: GET /api/exec-summary?clientId&planYearId&through=YYYY-MM
      // For now, we'll use mock data matching the template's Golden Sample Dataset
      const mockKPIs: ExecutiveSummaryKPIs = {
        planYearLabel: '2024 Plan Year',
        dataThrough: throughMonth,
        totalBudgetedPremium: 5585653,
        budgetPEPM: 988.79,
        medicalPaidClaims: 4499969,
        pharmacyPaidClaims: 678522,
        totalPaidClaims: 5178492,
        estStopLossReimb: -563512,
        estEarnedRxRebates: -423675,
        netPaidClaims: 4191305,
        netPaidClaimsPEPM: 741.96,
        administrationFees: 258894,
        stopLossFees: 817983,
        ibnrAdjustment: 0,
        totalPlanCost: 5268182,
        totalPlanCostPEPM: 932.59,
        surplusDeficit: 317471,
        percentOfBudget: 94.3,
        monthlyVsBudget: {
          under: 14,
          on: 3,
          over: 7,
        },
      };

      const mockDistribution: DistributionInsights = {
        medicalVsRx: {
          medicalPercent: 86.9,
          rxPercent: 13.1,
        },
        planMix: [
          { planId: 'ppo-base', planName: 'PPO Base', paidClaims: 3027466, percentOfTotal: 58 },
          { planId: 'ppo-buyup', planName: 'PPO Buy-Up', paidClaims: 2019400, percentOfTotal: 39 },
          { planId: 'hdhp', planName: 'HDHP', paidClaims: 133050, percentOfTotal: 3 },
        ],
        highCostBuckets: {
          over200k: {
            count: 4,
            totalPaid: 1040000,
            percentOfTotal: 20,
          },
          between100kAnd200k: {
            count: 4,
            totalPaid: 590000,
            percentOfTotal: 11,
          },
          allOther: {
            totalPaid: 3548492,
            percentOfTotal: 69,
          },
          employerResponsibility: 1390000,
          stopLossReimbursement: 240000,
        },
      };

      setKpis(mockKPIs);
      setFuelGauge(calculateFuelGauge(mockKPIs.percentOfBudget));
      setDistributionInsights(mockDistribution);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executive summary');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading executive summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadExecutiveSummary}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!kpis || !fuelGauge || !distributionInsights) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">No data available for the selected period.</p>
        </div>
      </div>
    );
  }

  async function handleExportPDF() {
    if (!kpis || !fuelGauge) return;

    try {
      await generateExecutiveSummaryPDF({
        clientName: "Flavio's Dog House",
        planYear: `${selectedPlanYear} Plan Year`,
        dataThrough: throughMonth,
        kpis: {
          totalCost: kpis.totalPlanCost,
          budgetedPremium: kpis.totalBudgetedPremium,
          surplusDeficit: kpis.surplusDeficit,
          percentOfBudget: kpis.percentOfBudget,
          medicalPaidClaims: kpis.medicalPaidClaims,
          pharmacyPaidClaims: kpis.pharmacyPaidClaims,
          totalSubscribers: 450, // Would come from API
        },
        fuelGauge: {
          value: kpis.percentOfBudget,
          status: fuelGauge.status.toLowerCase() as 'red' | 'green' | 'yellow',
          label: kpis.percentOfBudget < 95
            ? 'Under Budget'
            : kpis.percentOfBudget <= 105
              ? 'On Target'
              : 'Over Budget',
        },
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Executive Summary
          </h1>
          <p className="text-gray-600">
            {kpis.planYearLabel} - Data through {new Date(kpis.dataThrough).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-end">
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
            Through Month
          </label>
          <input
            type="month"
            value={throughMonth}
            onChange={(e) => setThroughMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={loadExecutiveSummary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Top Row: Fuel Gauge + KPI Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Fuel Gauge */}
        <div className="lg:col-span-1">
          <FuelGauge config={fuelGauge} />
        </div>

        {/* KPI Tiles */}
        <div className="lg:col-span-3">
          <KPITiles kpis={kpis} />
        </div>
      </div>

      {/* Plan Year to Date Chart */}
      <div className="mb-8">
        <PlanYTDChart clientId={selectedClient} planYearId={selectedPlanYear} />
      </div>

      {/* Distribution Insights */}
      <div className="mb-8">
        <DistributionPanels insights={distributionInsights} />
      </div>

      {/* Observations */}
      <div>
        <ObservationsPanel kpis={kpis} insights={distributionInsights} />
      </div>
    </div>
  );
}
