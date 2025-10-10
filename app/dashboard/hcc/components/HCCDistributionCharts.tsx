'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface HCCBucketData {
  label: string;
  count: number;
  totalCost: number;
  percentage: number;
}

interface HCCStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface HCCDistributionChartsProps {
  buckets: HCCBucketData[];
  statusDistribution: HCCStatusData[];
}

export function HCCBucketsBarChart({ buckets }: { buckets: HCCBucketData[] }) {
  const chartData = {
    labels: buckets.map(b => b.label),
    datasets: [
      {
        label: 'Number of Claimants',
        data: buckets.map(b => b.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // Red for >$200k
          'rgba(251, 146, 60, 0.8)', // Orange for $150k-$200k
          'rgba(251, 191, 36, 0.8)', // Yellow for $100k-$150k
          'rgba(34, 197, 94, 0.8)', // Green for <$100k
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
          stepSize: 1,
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
        display: false,
      },
      title: {
        display: true,
        text: 'High Cost Claimants by Cost Bucket',
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
            const bucket = buckets[context.dataIndex];
            return [
              `Count: ${bucket.count} claimants`,
              `Total Cost: $${bucket.totalCost.toLocaleString()}`,
              `Percentage: ${bucket.percentage.toFixed(1)}%`,
            ];
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

export function HCCStatusDoughnutChart({ statusDistribution }: { statusDistribution: HCCStatusData[] }) {
  const chartData = {
    labels: statusDistribution.map(s => s.status),
    datasets: [
      {
        label: 'Claimants by Status',
        data: statusDistribution.map(s => s.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green for ACTIVE
          'rgba(251, 146, 60, 0.8)', // Orange for TERMINATED
          'rgba(59, 130, 246, 0.8)', // Blue for COBRA
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
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
        text: 'Claimants by Status',
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
            const status = statusDistribution[context.dataIndex];
            return [
              `Count: ${status.count} claimants`,
              `Percentage: ${status.percentage.toFixed(1)}%`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export default function HCCDistributionCharts({ buckets, statusDistribution }: HCCDistributionChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6" style={{ height: '400px' }}>
        <HCCBucketsBarChart buckets={buckets} />
      </div>
      <div className="bg-white rounded-lg shadow p-6" style={{ height: '400px' }}>
        <HCCStatusDoughnutChart statusDistribution={statusDistribution} />
      </div>
    </div>
  );
}
