'use client';

/**
 * KPI Tiles Component
 * Displays key Plan Year to Date metrics in a grid layout
 * Matches template page 2 executive summary table
 */

import React from 'react';
import type { ExecutiveSummaryKPIs } from '@/types/enterprise-template';
import { formatCurrency, formatNumber } from '@/lib/calculations/template-formulas';

interface KPITilesProps {
  kpis: ExecutiveSummaryKPIs;
}

interface KPITile {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  tooltip?: string;
}

export function KPITiles({ kpis }: KPITilesProps) {
  const tiles: KPITile[] = [
    {
      label: 'Total Budgeted Premium',
      value: formatCurrency(kpis.totalBudgetedPremium),
      subValue: `${formatCurrency(kpis.budgetPEPM)} PEPM`,
      tooltip: 'Total premium budget for the plan year to date',
    },
    {
      label: 'Medical Paid Claims',
      value: formatCurrency(kpis.medicalPaidClaims),
      tooltip: 'Total medical claims paid',
    },
    {
      label: 'Pharmacy Paid Claims',
      value: formatCurrency(kpis.pharmacyPaidClaims),
      tooltip: 'Total pharmacy claims paid',
    },
    {
      label: 'Total Paid Claims',
      value: formatCurrency(kpis.totalPaidClaims),
      tooltip: 'Sum of medical and pharmacy claims',
    },
    {
      label: 'Est. Stop Loss Reimb.',
      value: formatCurrency(kpis.estStopLossReimb),
      trend: 'positive',
      tooltip: 'Estimated stop loss reimbursements (reduces net claims)',
    },
    {
      label: 'Est. Earned Rx Rebates',
      value: formatCurrency(kpis.estEarnedRxRebates),
      trend: 'positive',
      tooltip: 'Estimated pharmacy rebates based on contractual terms',
    },
    {
      label: 'Net Paid Claims',
      value: formatCurrency(kpis.netPaidClaims),
      subValue: `${formatCurrency(kpis.netPaidClaimsPEPM)} PEPM`,
      tooltip: 'Claims after stop loss reimbursements and Rx rebates',
    },
    {
      label: 'Administration Fees',
      value: formatCurrency(kpis.administrationFees),
      tooltip: 'Total administrative fees',
    },
    {
      label: 'Stop Loss Fees',
      value: formatCurrency(kpis.stopLossFees),
      tooltip: 'Total stop loss insurance fees',
    },
    {
      label: 'IBNR Adjustment',
      value: formatCurrency(kpis.ibnrAdjustment),
      tooltip: 'Incurred But Not Reported adjustment',
    },
    {
      label: 'Total Plan Cost',
      value: formatCurrency(kpis.totalPlanCost),
      subValue: `${formatCurrency(kpis.totalPlanCostPEPM)} PEPM`,
      tooltip: 'Net claims + fees + IBNR',
    },
    {
      label: 'Surplus / Deficit',
      value: formatCurrency(kpis.surplusDeficit),
      trend: kpis.surplusDeficit >= 0 ? 'positive' : 'negative',
      tooltip: 'Budget - Total Plan Cost',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tiles.map((tile, index) => (
        <KPITileCard key={index} tile={tile} />
      ))}
    </div>
  );
}

function KPITileCard({ tile }: { tile: KPITile }) {
  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const trendBgColors = {
    positive: 'bg-green-50',
    negative: 'bg-red-50',
    neutral: 'bg-gray-50',
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        tile.trend
          ? trendBgColors[tile.trend]
          : 'bg-white border-gray-200'
      }`}
      title={tile.tooltip}
    >
      <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
        {tile.label}
      </div>

      <div
        className={`text-xl font-bold mb-1 ${
          tile.trend ? trendColors[tile.trend] : 'text-gray-900'
        }`}
      >
        {tile.value}
      </div>

      {tile.subValue && (
        <div className="text-sm text-gray-500">{tile.subValue}</div>
      )}
    </div>
  );
}
