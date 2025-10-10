'use client';

/**
 * Fuel Gauge Component
 * Visual indicator of % of budget with color-coded thresholds
 *
 * Thresholds (matching template page 2):
 * - GREEN: < 95% of budget
 * - YELLOW: 95% - 105% of budget
 * - RED: > 105% of budget
 */

import React from 'react';
import type { FuelGaugeConfig } from '@/types/enterprise-template';

interface FuelGaugeProps {
  config: FuelGaugeConfig;
}

export function FuelGauge({ config }: FuelGaugeProps) {
  const { percentOfBudget, status, color } = config;

  // Calculate arc angle (180 degrees = semicircle)
  // Map 0-200% to 0-180 degrees
  const maxPercent = 200;
  const clampedPercent = Math.min(percentOfBudget, maxPercent);
  const angle = (clampedPercent / maxPercent) * 180;

  // Status labels
  const statusLabels = {
    GREEN: 'Under Budget',
    YELLOW: 'On Target',
    RED: 'Over Budget',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        Plan Performance
      </h3>

      {/* Gauge Visual */}
      <div className="relative w-full aspect-square max-w-[200px] mx-auto">
        {/* Background arc */}
        <svg
          viewBox="0 0 200 120"
          className="w-full h-auto"
          style={{ overflow: 'visible' }}
        >
          {/* Background segments */}
          <path
            d="M 20 100 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#10b981"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.2"
          />
          <path
            d="M 100 20 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.2"
          />

          {/* Threshold markers */}
          <g>
            {/* 95% marker */}
            <line
              x1={100 + 75 * Math.cos((Math.PI * (180 - 85.5)) / 180)}
              y1={100 - 75 * Math.sin((Math.PI * (180 - 85.5)) / 180)}
              x2={100 + 90 * Math.cos((Math.PI * (180 - 85.5)) / 180)}
              y2={100 - 90 * Math.sin((Math.PI * (180 - 85.5)) / 180)}
              stroke="#666"
              strokeWidth="2"
            />
            <text
              x={100 + 100 * Math.cos((Math.PI * (180 - 85.5)) / 180)}
              y={100 - 100 * Math.sin((Math.PI * (180 - 85.5)) / 180)}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              95%
            </text>

            {/* 105% marker */}
            <line
              x1={100 + 75 * Math.cos((Math.PI * (180 - 94.5)) / 180)}
              y1={100 - 75 * Math.sin((Math.PI * (180 - 94.5)) / 180)}
              x2={100 + 90 * Math.cos((Math.PI * (180 - 94.5)) / 180)}
              y2={100 - 90 * Math.sin((Math.PI * (180 - 94.5)) / 180)}
              stroke="#666"
              strokeWidth="2"
            />
            <text
              x={100 + 100 * Math.cos((Math.PI * (180 - 94.5)) / 180)}
              y={100 - 100 * Math.sin((Math.PI * (180 - 94.5)) / 180)}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              105%
            </text>
          </g>

          {/* Active gauge arc */}
          <path
            d={`M 20 100 A 80 80 0 ${angle > 90 ? '1' : '0'} 1 ${
              100 + 80 * Math.cos((Math.PI * (180 - angle)) / 180)
            } ${100 - 80 * Math.sin((Math.PI * (180 - angle)) / 180)}`}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Needle */}
          <g transform={`rotate(${-angle} 100 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="#1f2937"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="#1f2937" />
          </g>
        </svg>
      </div>

      {/* Status Display */}
      <div className="text-center mt-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {statusLabels[status]}
        </div>

        <div className="mt-3">
          <div className="text-3xl font-bold text-gray-900">
            {percentOfBudget.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">of Budget</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">Under 95% - Under Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-600">95-105% - On Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Over 105% - Over Budget</span>
        </div>
      </div>
    </div>
  );
}
