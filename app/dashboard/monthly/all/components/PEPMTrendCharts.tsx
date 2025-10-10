'use client';

/**
 * PEPM Trend Charts Component
 * Shows rolling 24-month trends for Medical and Rx PEPM
 * Matches template page 3 charts
 *
 * Charts:
 * 1. PEPM Medical Claims (line chart)
 * 2. PEPM Rx Claims (line chart)
 *
 * Shows comparison: Current 12 vs Prior 12 with % change
 */

import React from 'react';
import type { MonthlyPlanStats, PEPMCalculation } from '@/types/enterprise-template';
import { formatCurrency, formatPercent, calculatePEPMPercentChange } from '@/lib/calculations/template-formulas';

interface PEPMTrendChartsProps {
  data: MonthlyPlanStats[];
  current12: PEPMCalculation | null;
  prior12: PEPMCalculation | null;
}

export function PEPMTrendCharts({ data, current12, prior12 }: PEPMTrendChartsProps) {
  // Calculate PEPM for each month
  const monthlyPEPMs = data.map((row) => ({
    medical: row.medicalClaims / row.totalSubscribers,
    rx: row.pharmacyClaims / row.totalSubscribers,
  }));

  // Calculate percent change
  const percentChange = current12 && prior12
    ? calculatePEPMPercentChange(current12, prior12)
    : { medical: 0, rx: 0 };

  // Month labels
  const monthLabels = [
    'Jul 23', 'Aug 23', 'Sep 23', 'Oct 23', 'Nov 23', 'Dec 23',
    'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24',
    'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24',
    'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* PEPM Medical Claims */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            PEPM Medical Claims
          </h3>
          {current12 && prior12 && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Current 12 vs Prior 12</div>
              <div className={`text-xl font-bold ${percentChange.medical >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {percentChange.medical >= 0 ? '+' : ''}{formatPercent(percentChange.medical, 0)}
              </div>
            </div>
          )}
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Line Chart: Medical PEPM Trend</p>
            <p className="text-sm text-gray-500">Chart.js implementation pending</p>
          </div>

          {/* Data Points Preview */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {current12 && prior12 && (
              <>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-semibold text-blue-600">{formatCurrency(current12.medicalPEPM)}</div>
                  <div className="text-gray-600">Current 12</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-semibold text-gray-600">{formatCurrency(prior12.medicalPEPM)}</div>
                  <div className="text-gray-600">Prior 12</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Data Table (for reference) */}
        <div className="mt-4 max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Month</th>
                <th className="px-2 py-1 text-right">Medical PEPM</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPEPMs.map((pepm, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-2 py-1">{monthLabels[index]}</td>
                  <td className="px-2 py-1 text-right">{formatCurrency(pepm.medical)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PEPM Rx Claims */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            PEPM Rx Claims
          </h3>
          {current12 && prior12 && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Current 12 vs Prior 12</div>
              <div className={`text-xl font-bold ${percentChange.rx >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {percentChange.rx >= 0 ? '+' : ''}{formatPercent(percentChange.rx, 0)}
              </div>
            </div>
          )}
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Line Chart: Rx PEPM Trend</p>
            <p className="text-sm text-gray-500">Chart.js implementation pending</p>
          </div>

          {/* Data Points Preview */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {current12 && prior12 && (
              <>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-semibold text-purple-600">{formatCurrency(current12.rxPEPM)}</div>
                  <div className="text-gray-600">Current 12</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-semibold text-gray-600">{formatCurrency(prior12.rxPEPM)}</div>
                  <div className="text-gray-600">Prior 12</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Data Table (for reference) */}
        <div className="mt-4 max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Month</th>
                <th className="px-2 py-1 text-right">Rx PEPM</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPEPMs.map((pepm, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-2 py-1">{monthLabels[index]}</td>
                  <td className="px-2 py-1 text-right">{formatCurrency(pepm.rx)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
