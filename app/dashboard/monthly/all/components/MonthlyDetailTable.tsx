'use client';

/**
 * Monthly Detail Table Component
 * Displays columns A-N matching template page 3
 *
 * Columns:
 * A - Month
 * B - Total Subscribers
 * C - Medical Claims
 * D - Pharmacy Claims
 * E - Gross Medical & Pharmacy Claims
 * F - Spec Stop Loss Reimb
 * G - Estimated Earned Pharmacy Rebates
 * H - Net Medical & Pharmacy Claims
 * I - Admin Fees
 * J - Stop Loss Fees
 * K - Total Plan Cost
 * L - Budgeted Premium
 * M - Surplus / (Deficit)
 * N - % of Budget
 */

import React from 'react';
import type { MonthlyPlanStats, PEPMCalculation } from '@/types/enterprise-template';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/calculations/template-formulas';

interface MonthlyDetailTableProps {
  data: MonthlyPlanStats[];
  pepmCalculations: {
    currentPY: PEPMCalculation | null;
    priorPY: PEPMCalculation | null;
    current12: PEPMCalculation | null;
    prior12: PEPMCalculation | null;
  };
}

export function MonthlyDetailTable({ data, pepmCalculations }: MonthlyDetailTableProps) {
  // Month labels (in production, would come from actual dates)
  const monthLabels = [
    '7/1/2023', '8/1/2023', '9/1/2023', '10/1/2023', '11/1/2023', '12/1/2023',
    '1/1/2024', '2/1/2024', '3/1/2024', '4/1/2024', '5/1/2024', '6/1/2024',
    '7/1/2024', '8/1/2024', '9/1/2024', '10/1/2024', '11/1/2024', '12/1/2024',
    '1/1/2025', '2/1/2025', '3/1/2025', '4/1/2025', '5/1/2025', '6/1/2025',
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-purple-900 text-white sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">A<br/>Month</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">B<br/>Total<br/>Subscribers</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">C<br/>Medical<br/>Claims</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">D<br/>Pharmacy<br/>Claims</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap bg-purple-800">E<br/>Gross Medical<br/>& Pharmacy<br/>Claims</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">F<br/>Spec Stop<br/>Loss Reimb</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">G<br/>Estimated<br/>Earned<br/>Pharmacy<br/>Rebates*</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap bg-purple-800">H<br/>Net Medical &<br/>Pharmacy<br/>Claims</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">I<br/>Admin<br/>Fees</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">J<br/>Stop Loss<br/>Fees</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap bg-purple-800">K<br/>Total Plan<br/>Cost</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">L<br/>Budgeted<br/>Premium</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap bg-purple-800">M<br/>Surplus /<br/>(Deficit)</th>
              <th className="px-3 py-3 text-right font-semibold whitespace-nowrap bg-purple-800">N<br/>% of<br/>Budget</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => {
              const isCurrentPY = index >= 12;
              const bgColor = isCurrentPY ? 'bg-white' : 'bg-gray-50';
              const percentColor = row.percentOfBudget < 95 ? 'text-green-600' :
                                  row.percentOfBudget > 105 ? 'text-red-600' :
                                  'text-amber-600';

              return (
                <tr key={row.id} className={`border-t border-gray-200 ${bgColor} hover:bg-blue-50`}>
                  <td className="px-3 py-2 whitespace-nowrap">{monthLabels[index]}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.totalSubscribers)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.medicalClaims)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.pharmacyClaims)}</td>
                  <td className="px-3 py-2 text-right bg-gray-50 font-semibold">{formatCurrency(row.grossMedicalPharmacyClaims)}</td>
                  <td className="px-3 py-2 text-right text-red-600">{formatCurrency(row.specStopLossReimb)}</td>
                  <td className="px-3 py-2 text-right text-red-600">{formatCurrency(row.estimatedRxRebates)}</td>
                  <td className="px-3 py-2 text-right bg-gray-50 font-semibold">{formatCurrency(row.netMedicalPharmacyClaims)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.adminFees)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.stopLossFees)}</td>
                  <td className="px-3 py-2 text-right bg-gray-50 font-semibold">{formatCurrency(row.totalPlanCost)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.budgetedPremium)}</td>
                  <td className={`px-3 py-2 text-right bg-gray-50 font-semibold ${row.surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(row.surplusDeficit)}
                  </td>
                  <td className={`px-3 py-2 text-right bg-gray-50 font-semibold ${percentColor}`}>
                    {formatPercent(row.percentOfBudget)}
                  </td>
                </tr>
              );
            })}

            {/* Summary Rows */}
            {pepmCalculations.currentPY && (
              <>
                <SummaryRow
                  label="Current PY"
                  pepm={pepmCalculations.currentPY}
                  bgColor="bg-blue-50"
                />
                <SummaryRow
                  label="Prior PY"
                  pepm={pepmCalculations.priorPY!}
                  bgColor="bg-blue-50"
                />
                <SummaryRow
                  label="Current 12"
                  pepm={pepmCalculations.current12!}
                  bgColor="bg-blue-100"
                />
                <SummaryRow
                  label="Prior 12"
                  pepm={pepmCalculations.prior12!}
                  bgColor="bg-blue-100"
                />

                {/* PEPM Rows */}
                <PEPMRow
                  label="Current PY PEPM"
                  pepm={pepmCalculations.currentPY}
                  bgColor="bg-green-50"
                />
                <PEPMRow
                  label="Prior PY PEPM"
                  pepm={pepmCalculations.priorPY!}
                  bgColor="bg-green-50"
                />
                <PEPMRow
                  label="Current 12 PEPM"
                  pepm={pepmCalculations.current12!}
                  bgColor="bg-green-100"
                />
                <PEPMRow
                  label="Prior 12 PEPM"
                  pepm={pepmCalculations.prior12!}
                  bgColor="bg-green-100"
                />
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        * Earned Pharmacy Rebates are estimated based on contractual terms and group utilization; actual rebates may vary.
      </div>
    </div>
  );
}

function SummaryRow({ label, pepm, bgColor }: { label: string; pepm: PEPMCalculation; bgColor: string }) {
  // Calculate totals from PEPM (reverse calculation)
  const totalSubscribers = Math.round(pepm.memberMonths);
  const medicalClaims = pepm.medicalPEPM * pepm.averageSubscribers;
  const rxClaims = pepm.rxPEPM * pepm.averageSubscribers;
  const grossClaims = pepm.grossClaimsPEPM * pepm.averageSubscribers;
  const netClaims = pepm.netClaimsPEPM * pepm.averageSubscribers;
  const adminFees = pepm.adminFeesPEPM * pepm.averageSubscribers;
  const stopLossFees = pepm.stopLossFeesPEPM * pepm.averageSubscribers;
  const totalCost = pepm.totalPlanCostPEPM * pepm.averageSubscribers;
  const budget = pepm.budgetPEPM * pepm.averageSubscribers;
  const surplus = pepm.variancePEPM * pepm.averageSubscribers;

  const percentColor = pepm.percentOfBudget < 95 ? 'text-green-600' :
                      pepm.percentOfBudget > 105 ? 'text-red-600' :
                      'text-amber-600';

  return (
    <tr className={`border-t-2 border-gray-400 ${bgColor} font-semibold`}>
      <td className="px-3 py-2">{label}</td>
      <td className="px-3 py-2 text-right">{formatNumber(totalSubscribers)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(medicalClaims)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(rxClaims)}</td>
      <td className="px-3 py-2 text-right bg-gray-100">{formatCurrency(grossClaims)}</td>
      <td className="px-3 py-2 text-right">$0</td>
      <td className="px-3 py-2 text-right">($75.00)</td>
      <td className="px-3 py-2 text-right bg-gray-100">{formatCurrency(netClaims)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(adminFees)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(stopLossFees)}</td>
      <td className="px-3 py-2 text-right bg-gray-100">{formatCurrency(totalCost)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(budget)}</td>
      <td className={`px-3 py-2 text-right bg-gray-100 ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(surplus)}
      </td>
      <td className={`px-3 py-2 text-right bg-gray-100 ${percentColor}`}>
        {formatPercent(pepm.percentOfBudget)}
      </td>
    </tr>
  );
}

function PEPMRow({ label, pepm, bgColor }: { label: string; pepm: PEPMCalculation; bgColor: string }) {
  const percentColor = pepm.percentOfBudget < 95 ? 'text-green-600' :
                      pepm.percentOfBudget > 105 ? 'text-red-600' :
                      'text-amber-600';

  return (
    <tr className={`border-t border-gray-300 ${bgColor} font-semibold`}>
      <td className="px-3 py-2">{label}</td>
      <td className="px-3 py-2 text-right">{Math.round(pepm.averageSubscribers)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(pepm.medicalPEPM)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(pepm.rxPEPM)}</td>
      <td className="px-3 py-2 text-right bg-gray-100">{formatCurrency(pepm.grossClaimsPEPM)}</td>
      <td className="px-3 py-2 text-right">$0.00</td>
      <td className="px-3 py-2 text-right">($75.00)</td>
      <td className="px-3 py-2 text-right bg-gray-100">{formatCurrency(pepm.netClaimsPEPM)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(pepm.adminFeesPEPM)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(pepm.stopLossFeesPEPM)}</td>
      <td className="px-3 py-2 text-right bg-gray-100">{formatCurrency(pepm.totalPlanCostPEPM)}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(pepm.budgetPEPM)}</td>
      <td className={`px-3 py-2 text-right bg-gray-100 ${pepm.variancePEPM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(pepm.variancePEPM)}
      </td>
      <td className={`px-3 py-2 text-right bg-gray-100 ${percentColor}`}>
        {formatPercent(pepm.percentOfBudget)}
      </td>
    </tr>
  );
}
