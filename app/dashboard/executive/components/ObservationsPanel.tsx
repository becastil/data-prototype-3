'use client';

/**
 * Observations Panel
 * Auto-generated insights + editable notes
 * Matches template page 2 observations section
 */

import React, { useState } from 'react';
import type { ExecutiveSummaryKPIs, DistributionInsights } from '@/types/enterprise-template';
import { formatPercent, formatCurrency } from '@/lib/calculations/template-formulas';

interface ObservationsPanelProps {
  kpis: ExecutiveSummaryKPIs;
  insights: DistributionInsights;
}

export function ObservationsPanel({ kpis, insights }: ObservationsPanelProps) {
  const [editMode, setEditMode] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  // Auto-generate observations based on data
  const autoObservations = generateObservations(kpis, insights);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Observations</h3>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          {editMode ? 'Save Notes' : 'Add Notes'}
        </button>
      </div>

      {/* Monthly vs Budget Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {kpis.monthlyVsBudget.under}
            </div>
            <div className="text-xs text-gray-600 mt-1">Under</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {kpis.monthlyVsBudget.on}
            </div>
            <div className="text-xs text-gray-600 mt-1">On</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {kpis.monthlyVsBudget.over}
            </div>
            <div className="text-xs text-gray-600 mt-1">Over</div>
          </div>
        </div>
        <div className="text-xs text-gray-600 text-center mt-2">
          Monthly vs. Budget Distribution
        </div>
      </div>

      {/* Auto-generated observations */}
      <div className="space-y-3 mb-6">
        {autoObservations.map((obs, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2" />
            <p className="text-sm text-gray-700">{obs}</p>
          </div>
        ))}
      </div>

      {/* Custom notes */}
      {editMode ? (
        <textarea
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Add your custom observations and notes here..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      ) : customNotes ? (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Custom Notes
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {customNotes}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Generate automatic observations based on data patterns
 */
function generateObservations(
  kpis: ExecutiveSummaryKPIs,
  insights: DistributionInsights
): string[] {
  const observations: string[] = [];

  // Budget performance observation
  if (kpis.percentOfBudget < 95) {
    observations.push(
      `${kpis.planYearLabel} is running at ${formatPercent(kpis.percentOfBudget)} of budget for the rolling 12 month period and plan year through ${new Date(kpis.dataThrough).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`
    );
  } else if (kpis.percentOfBudget > 105) {
    observations.push(
      `${kpis.planYearLabel} is exceeding budget at ${formatPercent(kpis.percentOfBudget)}, indicating higher than expected claims activity.`
    );
  } else {
    observations.push(
      `${kpis.planYearLabel} is performing within target range at ${formatPercent(kpis.percentOfBudget)} of budget.`
    );
  }

  // High-cost claimants observation
  const hccCount =
    insights.highCostBuckets.over200k.count +
    insights.highCostBuckets.between100kAnd200k.count;
  if (hccCount > 0) {
    observations.push(
      `There are ${hccCount} high cost claimants exceeding 50% of the Individual Stop Loss (ISL) limit year-to-date. Estimated stop loss reimbursements through ${new Date(kpis.dataThrough).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} are ${formatCurrency(Math.abs(kpis.estStopLossReimb))}.`
    );
  }

  // Medical vs Rx observation
  observations.push(
    `Medical claims represent approximately ${formatPercent(insights.medicalVsRx.medicalPercent, 0)} of paid claims, whereas the remaining ${formatPercent(insights.medicalVsRx.rxPercent, 0)} are attributable to pharmacy claims.`
  );

  // High-cost buckets observation
  observations.push(
    `High Cost Claimants with $200,000+ in paid claims represent ${formatPercent(insights.highCostBuckets.over200k.percentOfTotal, 0)} of paid claims, whereas claimants $100,000-$200,000 represent ${formatPercent(insights.highCostBuckets.between100kAnd200k.percentOfTotal, 0)} of paid claims and the remaining ${formatPercent(insights.highCostBuckets.allOther.percentOfTotal, 0)} is attributable to all other claimants.`
  );

  // Plan mix observation
  if (insights.planMix.length > 0) {
    const planDescriptions = insights.planMix
      .map((p) => `${formatPercent(p.percentOfTotal, 0)} to the ${p.planName}`)
      .join(', followed by ');

    observations.push(
      `With regard to paid claims distribution by plan, ${planDescriptions}.`
    );
  }

  return observations;
}
