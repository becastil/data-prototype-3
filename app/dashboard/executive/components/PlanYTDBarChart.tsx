'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PlanYTDData {
  month: string;
  hdhp: number;
  ppoBase: number;
  ppoBuyUp: number;
}

interface PlanYTDBarChartProps {
  data: PlanYTDData[];
  title?: string;
}

export default function PlanYTDBarChart({ data, title = 'Plan YTD Cost Distribution' }: PlanYTDBarChartProps) {
  // Prepare chart data
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'HDHP',
        data: data.map(d => d.hdhp),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'PPO Base',
        data: data.map(d => d.ppoBase),
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'PPO Buy-Up',
        data: data.map(d => d.ppoBuyUp),
        backgroundColor: 'rgba(251, 146, 60, 0.8)', // Orange
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
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
            return `${label}: $${value.toLocaleString()}`;
          },
          footer: function(tooltipItems) {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: $${total.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
