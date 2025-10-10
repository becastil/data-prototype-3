'use client';

/**
 * Plan Year to Date Stacked Chart
 * Matches template page 2 - monthly breakdown with stacked bars
 *
 * Series (bottom to top):
 * - Admin Fees
 * - Stop Loss Fees
 * - Net Medical & Pharmacy Claims
 * - Spec Stop Loss Reimb (patterned overlay)
 * - Estimated Earned Rx Rebates (patterned overlay)
 * - Budgeted Premium (line overlay)
 */

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PlanYTDChartProps {
  clientId: string;
  planYearId: string;
}

export function PlanYTDChart({ clientId, planYearId }: PlanYTDChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      type: 'bar' | 'line';
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      stack?: string;
      order: number;
      pointRadius?: number;
      pointHoverRadius?: number;
      tension?: number;
      fill?: boolean;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/monthly-detail?clientId=${clientId}&planYearId=${planYearId}&planId=ALL_PLANS&months=12`);
        const result = await response.json();

        if (result.success && result.data.monthlyStats) {
          const stats = result.data.monthlyStats;

          interface MonthlyStatAPI {
            monthSnapshotId: string;
            adminFees: number;
            stopLossFees: number;
            netMedicalPharmacyClaims: number;
            budgetedPremium: number;
          }

          const data = {
            labels: stats.map((s: MonthlyStatAPI) => {
              const date = new Date(s.monthSnapshotId);
              return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }),
            datasets: [
              {
                type: 'bar' as const,
                label: 'Admin Fees',
                data: stats.map((s: MonthlyStatAPI) => s.adminFees),
                backgroundColor: 'rgba(191, 219, 254, 0.8)',
                borderColor: 'rgba(147, 197, 253, 1)',
                borderWidth: 1,
                stack: 'stack0',
                order: 3,
              },
              {
                type: 'bar' as const,
                label: 'Stop Loss Fees',
                data: stats.map((s: MonthlyStatAPI) => s.stopLossFees),
                backgroundColor: 'rgba(221, 214, 254, 0.8)',
                borderColor: 'rgba(196, 181, 253, 1)',
                borderWidth: 1,
                stack: 'stack0',
                order: 3,
              },
              {
                type: 'bar' as const,
                label: 'Net Med & Rx Claims',
                data: stats.map((s: MonthlyStatAPI) => s.netMedicalPharmacyClaims),
                backgroundColor: 'rgba(134, 239, 172, 0.8)',
                borderColor: 'rgba(74, 222, 128, 1)',
                borderWidth: 1,
                stack: 'stack0',
                order: 3,
              },
              {
                type: 'line' as const,
                label: 'Budgeted Premium',
                data: stats.map((s: MonthlyStatAPI) => s.budgetedPremium),
                borderColor: 'rgba(31, 41, 55, 1)',
                backgroundColor: 'rgba(31, 41, 55, 0.1)',
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.1,
                fill: false,
                order: 1,
              },
            ],
          };

          setChartData(data);
        }
      } catch (error) {
        console.error('Error loading Plan YTD data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [clientId, planYearId]);

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + (Number(value) / 1000).toFixed(0) + 'k';
          },
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Plan Year to Date Graph
      </h3>

      <div className="h-96">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-600">Loading chart data...</p>
          </div>
        ) : chartData ? (
          <Chart type="bar" data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
            <p className="text-gray-600">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
