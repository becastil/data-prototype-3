'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PEPMDataPoint {
  month: string;
  actual: number;
  budget?: number;
  priorYear?: number;
}

interface PEPMTrendChartProps {
  data: PEPMDataPoint[];
  title: string;
  type: 'medical' | 'pharmacy';
}

export default function PEPMTrendChart({ data, title, type }: PEPMTrendChartProps) {
  const colors = type === 'medical'
    ? {
        actual: 'rgba(239, 68, 68, 0.8)', // Red for medical
        actualBorder: 'rgba(239, 68, 68, 1)',
        budget: 'rgba(59, 130, 246, 0.8)', // Blue for budget
        budgetBorder: 'rgba(59, 130, 246, 1)',
        prior: 'rgba(156, 163, 175, 0.8)', // Gray for prior year
        priorBorder: 'rgba(156, 163, 175, 1)',
      }
    : {
        actual: 'rgba(16, 185, 129, 0.8)', // Green for pharmacy
        actualBorder: 'rgba(16, 185, 129, 1)',
        budget: 'rgba(59, 130, 246, 0.8)',
        budgetBorder: 'rgba(59, 130, 246, 1)',
        prior: 'rgba(156, 163, 175, 0.8)',
        priorBorder: 'rgba(156, 163, 175, 1)',
      };

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Actual PEPM',
        data: data.map(d => d.actual),
        borderColor: colors.actualBorder,
        backgroundColor: colors.actual,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false,
      },
      ...(data.some(d => d.budget !== undefined) ? [{
        label: 'Budget PEPM',
        data: data.map(d => d.budget || null),
        borderColor: colors.budgetBorder,
        backgroundColor: colors.budget,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
      }] : []),
      ...(data.some(d => d.priorYear !== undefined) ? [{
        label: 'Prior Year PEPM',
        data: data.map(d => d.priorYear || null),
        borderColor: colors.priorBorder,
        backgroundColor: colors.prior,
        borderWidth: 2,
        borderDash: [2, 2],
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: false,
      }] : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
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
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toFixed(0);
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
        position: 'top' as const,
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
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
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
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
