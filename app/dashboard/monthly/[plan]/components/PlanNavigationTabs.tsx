'use client';

/**
 * Plan Navigation Tabs Component
 * Allows switching between All Plans and individual plan views
 * Matches template navigation pattern
 */

import React from 'react';
import Link from 'next/link';

interface PlanNavigationTabsProps {
  activePlan: string; // 'all' | 'hdhp' | 'ppo-base' | 'ppo-buyup'
}

interface TabConfig {
  slug: string;
  label: string;
  href: string;
}

const TABS: TabConfig[] = [
  { slug: 'all', label: 'All Plans', href: '/dashboard/monthly/all' },
  { slug: 'hdhp', label: 'HDHP', href: '/dashboard/monthly/hdhp' },
  { slug: 'ppo-base', label: 'PPO Base', href: '/dashboard/monthly/ppo-base' },
  { slug: 'ppo-buyup', label: 'PPO Buy-Up', href: '/dashboard/monthly/ppo-buyup' },
];

export function PlanNavigationTabs({ activePlan }: PlanNavigationTabsProps) {
  return (
    <div className="mb-6">
      <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1" aria-label="Plan tabs">
        {TABS.map((tab) => {
          const isActive = activePlan === tab.slug;

          return (
            <Link
              key={tab.slug}
              href={tab.href}
              className={`
                flex-1 py-2 px-4 text-center text-sm font-medium rounded-md
                transition-all duration-200
                ${isActive
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
