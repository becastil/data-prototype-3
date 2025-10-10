'use client';

import { useMemo } from 'react';

export interface BudgetDataPoint {
  period: string;
  claims: number;
  fixedCosts: number;
  budget: number;
}

/**
 * Hook that provides sample budget vs actuals data for the combination chart
 * In production, this would fetch from API/database
 */
export function useBudgetData(): BudgetDataPoint[] {
  return useMemo(() => {
    // Sample data representing monthly claims, fixed costs, and budget
    // These align with the healthcare analytics dashboard months
    return [
      {
        period: 'Apr 2024',
        claims: 450000,
        fixedCosts: 95000,
        budget: 600000,
      },
      {
        period: 'May 2024',
        claims: 620000,
        fixedCosts: 110000,
        budget: 600000,
      },
      {
        period: 'Jun 2024',
        claims: 480000,
        fixedCosts: 102000,
        budget: 600000,
      },
      {
        period: 'Jul 2024',
        claims: 410000,
        fixedCosts: 98000,
        budget: 600000,
      },
      {
        period: 'Aug 2024',
        claims: 580000,
        fixedCosts: 115000,
        budget: 620000,
      },
      {
        period: 'Sep 2024',
        claims: 320000,
        fixedCosts: 88000,
        budget: 620000,
      },
      {
        period: 'Oct 2024',
        claims: 485000,
        fixedCosts: 105000,
        budget: 620000,
      },
      {
        period: 'Nov 2024',
        claims: 520000,
        fixedCosts: 112000,
        budget: 630000,
      },
      {
        period: 'Dec 2024',
        claims: 590000,
        fixedCosts: 118000,
        budget: 630000,
      },
      {
        period: 'Jan 2025',
        claims: 510000,
        fixedCosts: 108000,
        budget: 630000,
      },
      {
        period: 'Feb 2025',
        claims: 480000,
        fixedCosts: 102000,
        budget: 640000,
      },
      {
        period: 'Mar 2025',
        claims: 919000,
        fixedCosts: 122000,
        budget: 640000,
      },
    ];
  }, []);
}

/**
 * Hook for generating budget data from uploaded claims data
 * This would parse actual claims CSV files and calculate monthly aggregates
 *
 * @param claimsData - Array of claim records from uploaded CSV
 * @param fixedCostRate - Monthly fixed cost rate (default: varies by month)
 * @param budgetAmount - Monthly budget target (default: calculated from historical avg)
 */
interface ClaimData {
  year_month?: string;
  period?: string;
  total_payment?: number;
}

export function useCalculatedBudgetData(
  claimsData?: ClaimData[],
  fixedCostRate?: number,
  budgetAmount?: number
): BudgetDataPoint[] {
  return useMemo(() => {
    if (!claimsData || claimsData.length === 0) {
      // Return empty array if no data
      return [];
    }

    // Group claims by year_month
    const monthlyData = claimsData.reduce((acc, claim) => {
      const period = claim.year_month || claim.period;
      if (!period) return acc;

      if (!acc[period]) {
        acc[period] = {
          period,
          totalClaims: 0,
          claimCount: 0,
        };
      }

      acc[period].totalClaims += claim.total_payment || 0;
      acc[period].claimCount += 1;

      return acc;
    }, {} as Record<string, { period: string; totalClaims: number; claimCount: number }>);

    // Calculate fixed costs and budget
    const defaultFixedCost = fixedCostRate || 100000;
    const monthlyValues = Object.values(monthlyData) as Array<{ period: string; totalClaims: number; claimCount: number }>;
    const avgClaims = monthlyValues.reduce((sum, d) => sum + d.totalClaims, 0) / Object.keys(monthlyData).length;
    const defaultBudget = budgetAmount || avgClaims * 1.15; // 15% buffer over average

    // Convert to BudgetDataPoint array
    return monthlyValues
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(monthData => ({
        period: monthData.period,
        claims: monthData.totalClaims,
        fixedCosts: defaultFixedCost,
        budget: defaultBudget,
      }));
  }, [claimsData, fixedCostRate, budgetAmount]);
}

/**
 * Hook for quarterly aggregation of budget data
 */
export function useQuarterlyBudgetData(monthlyData: BudgetDataPoint[]): BudgetDataPoint[] {
  return useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];

    // Group by quarter
    const quarters: Record<string, { claims: number; fixedCosts: number; budget: number; count: number }> = {};

    monthlyData.forEach(data => {
      // Extract month from period (assumes format like "Apr 2024" or "2024-04")
      const [monthStr, year] = data.period.includes(' ')
        ? data.period.split(' ')
        : data.period.split('-').reverse();

      const monthMap: Record<string, number> = {
        Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
        Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
      };

      const monthNum = monthMap[monthStr] || parseInt(monthStr);
      const quarter = Math.ceil(monthNum / 3);
      const quarterKey = `Q${quarter} ${year}`;

      if (!quarters[quarterKey]) {
        quarters[quarterKey] = { claims: 0, fixedCosts: 0, budget: 0, count: 0 };
      }

      quarters[quarterKey].claims += data.claims;
      quarters[quarterKey].fixedCosts += data.fixedCosts;
      quarters[quarterKey].budget += data.budget;
      quarters[quarterKey].count += 1;
    });

    // Convert to array and average budget
    return Object.entries(quarters).map(([period, data]) => ({
      period,
      claims: data.claims,
      fixedCosts: data.fixedCosts,
      budget: data.budget / data.count, // Average budget for the quarter
    }));
  }, [monthlyData]);
}
