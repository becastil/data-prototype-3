'use client';

/**
 * Distribution Insights Panels
 * Matches template page 2:
 * - Medical vs Rx Claims breakdown
 * - Plan mix distribution
 * - High-cost claimant buckets
 */

import React from 'react';
import type { DistributionInsights } from '@/types/enterprise-template';
import { formatCurrency, formatPercent } from '@/lib/calculations/template-formulas';

interface DistributionPanelsProps {
  insights: DistributionInsights;
}

export function DistributionPanels({ insights }: DistributionPanelsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Medical vs Rx */}
      <MedicalVsRxPanel
        medicalPercent={insights.medicalVsRx.medicalPercent}
        rxPercent={insights.medicalVsRx.rxPercent}
      />

      {/* Plan Mix */}
      <PlanMixPanel planMix={insights.planMix} />

      {/* High-Cost Claimant Buckets */}
      <HighCostBucketsPanel buckets={insights.highCostBuckets} />
    </div>
  );
}

function MedicalVsRxPanel({
  medicalPercent,
  rxPercent,
}: {
  medicalPercent: number;
  rxPercent: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Medical and Pharmacy Claim Insights
      </h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Medical Claims</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatPercent(medicalPercent)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${medicalPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Rx Claims</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatPercent(rxPercent)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all"
              style={{ width: `${rxPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanMixPanel({
  planMix,
}: {
  planMix: DistributionInsights['planMix'];
}) {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Paid Claims by Plan
      </h3>

      <div className="space-y-3">
        {planMix.map((plan, index) => (
          <div key={plan.planId}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">{plan.planName}</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatPercent(plan.percentOfTotal)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${plan.percentOfTotal}%`,
                  backgroundColor: colors[index % colors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighCostBucketsPanel({
  buckets,
}: {
  buckets: DistributionInsights['highCostBuckets'];
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        High-Cost Claimant Buckets
      </h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">
              $200k+ ({buckets.over200k.count})
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatPercent(buckets.over200k.percentOfTotal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-600 h-2.5 rounded-full transition-all"
              style={{ width: `${buckets.over200k.percentOfTotal}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">
              $100k-$200k ({buckets.between100kAnd200k.count})
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatPercent(buckets.between100kAnd200k.percentOfTotal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-orange-500 h-2.5 rounded-full transition-all"
              style={{
                width: `${buckets.between100kAnd200k.percentOfTotal}%`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">All Other</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatPercent(buckets.allOther.percentOfTotal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all"
              style={{ width: `${buckets.allOther.percentOfTotal}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Employer Responsibility:</span>
          <span className="font-semibold">
            {formatCurrency(buckets.employerResponsibility)}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Stop Loss Reimbursement:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(buckets.stopLossReimbursement)}
          </span>
        </div>
      </div>
    </div>
  );
}
