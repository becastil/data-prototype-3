/**
 * Template Formula Engine
 * Implements exact calculations from "Medical-Rx Experience Report Template (2025.10.02).pdf"
 *
 * This module provides pure, deterministic functions for all metrics, matching
 * the template's column definitions (A-N) and executive summary calculations.
 */

import type {
  MonthlyPlanStats,
  PEPMCalculation,
  ExecutiveSummaryKPIs,
  DistributionInsights,
  HighClaimantBuckets,
  FuelGaugeConfig,
  FuelGaugeStatus,
  FormulaInput,
  FormulaOutput,
  HighClaimant,
  PlanYear,
} from '@/types/enterprise-template';

// ============================================================================
// COLUMN FORMULAS (A-N)
// Template Pages 3, 5-7: Monthly Detail tables
// ============================================================================

/**
 * Calculate Column E: Gross Medical & Pharmacy Claims
 * Formula: C + D
 */
export function calculateGrossClaims(
  medicalClaims: number,
  pharmacyClaims: number
): number {
  return medicalClaims + pharmacyClaims;
}

/**
 * Calculate Column H: Net Medical & Pharmacy Claims
 * Formula: E + F + G
 * Note: F and G are typically negative (reimbursements/rebates)
 */
export function calculateNetClaims(
  grossClaims: number,
  specStopLossReimb: number,
  estimatedRxRebates: number
): number {
  return grossClaims + specStopLossReimb + estimatedRxRebates;
}

/**
 * Calculate Column K: Total Plan Cost
 * Formula: H + I + J
 */
export function calculateTotalPlanCost(
  netClaims: number,
  adminFees: number,
  stopLossFees: number
): number {
  return netClaims + adminFees + stopLossFees;
}

/**
 * Calculate Column M: Surplus/(Deficit)
 * Formula: L - K
 */
export function calculateSurplusDeficit(
  budgetedPremium: number,
  totalPlanCost: number
): number {
  return budgetedPremium - totalPlanCost;
}

/**
 * Calculate Column N: % of Budget
 * Formula: K / L (expressed as percentage)
 */
export function calculatePercentOfBudget(
  totalPlanCost: number,
  budgetedPremium: number
): number {
  if (budgetedPremium <= 0) {
    return 0; // Avoid division by zero
  }
  return (totalPlanCost / budgetedPremium) * 100;
}

/**
 * Complete monthly statistics calculation (all columns A-N)
 */
export function calculateMonthlyStats(
  input: Partial<MonthlyPlanStats>
): MonthlyPlanStats {
  const grossClaims = calculateGrossClaims(
    input.medicalClaims || 0,
    input.pharmacyClaims || 0
  );

  const netClaims = calculateNetClaims(
    grossClaims,
    input.specStopLossReimb || 0,
    input.estimatedRxRebates || 0
  );

  const totalPlanCost = calculateTotalPlanCost(
    netClaims,
    input.adminFees || 0,
    input.stopLossFees || 0
  );

  const surplusDeficit = calculateSurplusDeficit(
    input.budgetedPremium || 0,
    totalPlanCost
  );

  const percentOfBudget = calculatePercentOfBudget(
    totalPlanCost,
    input.budgetedPremium || 0
  );

  return {
    id: input.id || '',
    monthSnapshotId: input.monthSnapshotId || '',
    planId: input.planId || 'ALL_PLANS',
    totalSubscribers: input.totalSubscribers || 0,
    enrollmentByTier: input.enrollmentByTier || {
      EMPLOYEE_ONLY: 0,
      EMPLOYEE_SPOUSE: 0,
      EMPLOYEE_CHILDREN: 0,
      FAMILY: 0,
    },
    medicalClaims: input.medicalClaims || 0,
    pharmacyClaims: input.pharmacyClaims || 0,
    grossMedicalPharmacyClaims: grossClaims,
    specStopLossReimb: input.specStopLossReimb || 0,
    estimatedRxRebates: input.estimatedRxRebates || 0,
    netMedicalPharmacyClaims: netClaims,
    adminFees: input.adminFees || 0,
    stopLossFees: input.stopLossFees || 0,
    totalPlanCost,
    budgetedPremium: input.budgetedPremium || 0,
    surplusDeficit,
    percentOfBudget,
  };
}

// ============================================================================
// PEPM CALCULATIONS
// Template Page 3: PEPM charts and summary rows
// ============================================================================

/**
 * Calculate PEPM metrics for a period
 */
export function calculatePEPM(
  monthlyStats: MonthlyPlanStats[],
  periodLabel: string
): PEPMCalculation {
  const monthCount = monthlyStats.length;
  if (monthCount === 0) {
    return createEmptyPEPM(periodLabel);
  }

  // Sum total subscribers across all months (member-months)
  const memberMonths = monthlyStats.reduce(
    (sum, m) => sum + m.totalSubscribers,
    0
  );

  // Average subscribers = member-months / number of months
  const averageSubscribers = memberMonths / monthCount;

  // Sum all metrics
  const totals = monthlyStats.reduce(
    (acc, m) => ({
      medical: acc.medical + m.medicalClaims,
      rx: acc.rx + m.pharmacyClaims,
      gross: acc.gross + m.grossMedicalPharmacyClaims,
      net: acc.net + m.netMedicalPharmacyClaims,
      adminFees: acc.adminFees + m.adminFees,
      stopLossFees: acc.stopLossFees + m.stopLossFees,
      totalCost: acc.totalCost + m.totalPlanCost,
      budget: acc.budget + m.budgetedPremium,
    }),
    {
      medical: 0,
      rx: 0,
      gross: 0,
      net: 0,
      adminFees: 0,
      stopLossFees: 0,
      totalCost: 0,
      budget: 0,
    }
  );

  // Calculate PEPMs (divide by average subscribers)
  const medicalPEPM = totals.medical / averageSubscribers;
  const rxPEPM = totals.rx / averageSubscribers;
  const grossClaimsPEPM = totals.gross / averageSubscribers;
  const netClaimsPEPM = totals.net / averageSubscribers;
  const adminFeesPEPM = totals.adminFees / averageSubscribers;
  const stopLossFeesPEPM = totals.stopLossFees / averageSubscribers;
  const totalPlanCostPEPM = totals.totalCost / averageSubscribers;
  const budgetPEPM = totals.budget / averageSubscribers;

  const variancePEPM = budgetPEPM - totalPlanCostPEPM;
  const percentOfBudget = calculatePercentOfBudget(totals.totalCost, totals.budget);

  return {
    periodLabel,
    memberMonths,
    averageSubscribers,
    medicalPEPM,
    rxPEPM,
    grossClaimsPEPM,
    netClaimsPEPM,
    adminFeesPEPM,
    stopLossFeesPEPM,
    totalPlanCostPEPM,
    budgetPEPM,
    variancePEPM,
    percentOfBudget,
  };
}

function createEmptyPEPM(periodLabel: string): PEPMCalculation {
  return {
    periodLabel,
    memberMonths: 0,
    averageSubscribers: 0,
    medicalPEPM: 0,
    rxPEPM: 0,
    grossClaimsPEPM: 0,
    netClaimsPEPM: 0,
    adminFeesPEPM: 0,
    stopLossFeesPEPM: 0,
    totalPlanCostPEPM: 0,
    budgetPEPM: 0,
    variancePEPM: 0,
    percentOfBudget: 0,
  };
}

/**
 * Calculate percent change between two PEPMs
 */
export function calculatePEPMPercentChange(
  current: PEPMCalculation,
  prior: PEPMCalculation
): { medical: number; rx: number } {
  const medicalChange =
    prior.medicalPEPM > 0
      ? ((current.medicalPEPM - prior.medicalPEPM) / prior.medicalPEPM) * 100
      : 0;

  const rxChange =
    prior.rxPEPM > 0 ? ((current.rxPEPM - prior.rxPEPM) / prior.rxPEPM) * 100 : 0;

  return {
    medical: medicalChange,
    rx: rxChange,
  };
}

// ============================================================================
// EXECUTIVE SUMMARY KPIs
// Template Page 2: Executive Summary metrics
// ============================================================================

/**
 * Calculate Plan Year to Date KPIs
 */
export function calculateExecutiveSummaryKPIs(
  monthlyStats: MonthlyPlanStats[],
  planYear: PlanYear,
  dataThrough: string
): ExecutiveSummaryKPIs {
  if (monthlyStats.length === 0) {
    return createEmptyExecutiveSummary(planYear, dataThrough);
  }

  // Sum all metrics for the period
  const totals = monthlyStats.reduce(
    (acc, m) => ({
      budgetedPremium: acc.budgetedPremium + m.budgetedPremium,
      medicalClaims: acc.medicalClaims + m.medicalClaims,
      rxClaims: acc.rxClaims + m.pharmacyClaims,
      grossClaims: acc.grossClaims + m.grossMedicalPharmacyClaims,
      specStopLoss: acc.specStopLoss + m.specStopLossReimb,
      rxRebates: acc.rxRebates + m.estimatedRxRebates,
      netClaims: acc.netClaims + m.netMedicalPharmacyClaims,
      adminFees: acc.adminFees + m.adminFees,
      stopLossFees: acc.stopLossFees + m.stopLossFees,
      totalCost: acc.totalCost + m.totalPlanCost,
      subscribers: acc.subscribers + m.totalSubscribers,
    }),
    {
      budgetedPremium: 0,
      medicalClaims: 0,
      rxClaims: 0,
      grossClaims: 0,
      specStopLoss: 0,
      rxRebates: 0,
      netClaims: 0,
      adminFees: 0,
      stopLossFees: 0,
      totalCost: 0,
      subscribers: 0,
    }
  );

  // Calculate averages
  const avgSubscribers = totals.subscribers / monthlyStats.length;
  const budgetPEPM = totals.budgetedPremium / avgSubscribers;
  const netClaimsPEPM = totals.netClaims / avgSubscribers;
  const totalCostPEPM = totals.totalCost / avgSubscribers;

  // Calculate variance
  const surplusDeficit = totals.budgetedPremium - totals.totalCost;
  const percentOfBudget = calculatePercentOfBudget(
    totals.totalCost,
    totals.budgetedPremium
  );

  // Monthly vs budget observations
  const monthlyVsBudget = monthlyStats.reduce(
    (acc, m) => {
      if (m.percentOfBudget < 95) {
        acc.under++;
      } else if (m.percentOfBudget <= 105) {
        acc.on++;
      } else {
        acc.over++;
      }
      return acc;
    },
    { under: 0, on: 0, over: 0 }
  );

  return {
    planYearLabel: planYear.yearLabel,
    dataThrough,
    totalBudgetedPremium: totals.budgetedPremium,
    budgetPEPM,
    medicalPaidClaims: totals.medicalClaims,
    pharmacyPaidClaims: totals.rxClaims,
    totalPaidClaims: totals.grossClaims,
    estStopLossReimb: totals.specStopLoss,
    estEarnedRxRebates: totals.rxRebates,
    netPaidClaims: totals.netClaims,
    netPaidClaimsPEPM: netClaimsPEPM,
    administrationFees: totals.adminFees,
    stopLossFees: totals.stopLossFees,
    ibnrAdjustment: 0, // From GlobalInputs
    totalPlanCost: totals.totalCost,
    totalPlanCostPEPM: totalCostPEPM,
    surplusDeficit,
    percentOfBudget,
    monthlyVsBudget,
  };
}

function createEmptyExecutiveSummary(
  planYear: PlanYear,
  dataThrough: string
): ExecutiveSummaryKPIs {
  return {
    planYearLabel: planYear.yearLabel,
    dataThrough,
    totalBudgetedPremium: 0,
    budgetPEPM: 0,
    medicalPaidClaims: 0,
    pharmacyPaidClaims: 0,
    totalPaidClaims: 0,
    estStopLossReimb: 0,
    estEarnedRxRebates: 0,
    netPaidClaims: 0,
    netPaidClaimsPEPM: 0,
    administrationFees: 0,
    stopLossFees: 0,
    ibnrAdjustment: 0,
    totalPlanCost: 0,
    totalPlanCostPEPM: 0,
    surplusDeficit: 0,
    percentOfBudget: 0,
    monthlyVsBudget: { under: 0, on: 0, over: 0 },
  };
}

// ============================================================================
// FUEL GAUGE
// Template Page 2: Color-coded performance indicator
// ============================================================================

/**
 * Determine fuel gauge status based on % of budget
 * Thresholds: <95% = GREEN, 95-105% = YELLOW, >105% = RED
 */
export function calculateFuelGauge(percentOfBudget: number): FuelGaugeConfig {
  let status: FuelGaugeStatus;
  let color: string;

  if (percentOfBudget < 95) {
    status = 'GREEN';
    color = '#10b981'; // Tailwind green-500
  } else if (percentOfBudget <= 105) {
    status = 'YELLOW';
    color = '#f59e0b'; // Tailwind amber-500
  } else {
    status = 'RED';
    color = '#ef4444'; // Tailwind red-500
  }

  return {
    percentOfBudget,
    status,
    color,
  };
}

// ============================================================================
// DISTRIBUTION INSIGHTS
// Template Page 2: Med vs Rx, Plan mix, HCC buckets
// ============================================================================

/**
 * Calculate Medical vs Rx distribution
 */
export function calculateMedicalVsRxDistribution(
  medicalPaid: number,
  rxPaid: number
): { medicalPercent: number; rxPercent: number } {
  const total = medicalPaid + rxPaid;
  if (total === 0) {
    return { medicalPercent: 0, rxPercent: 0 };
  }

  return {
    medicalPercent: (medicalPaid / total) * 100,
    rxPercent: (rxPaid / total) * 100,
  };
}

/**
 * Calculate plan mix distribution
 */
export function calculatePlanMixDistribution(
  planStats: Array<{
    planId: string;
    planName: string;
    medicalClaims: number;
    pharmacyClaims: number;
  }>
): Array<{
  planId: string;
  planName: string;
  paidClaims: number;
  percentOfTotal: number;
}> {
  const totalClaims = planStats.reduce(
    (sum, p) => sum + p.medicalClaims + p.pharmacyClaims,
    0
  );

  return planStats.map((plan) => {
    const paidClaims = plan.medicalClaims + plan.pharmacyClaims;
    const percentOfTotal = totalClaims > 0 ? (paidClaims / totalClaims) * 100 : 0;

    return {
      planId: plan.planId,
      planName: plan.planName,
      paidClaims,
      percentOfTotal,
    };
  });
}

// ============================================================================
// HIGH COST CLAIMANT ANALYSIS
// Template Page 4: ISL tracking and buckets
// ============================================================================

/**
 * Calculate high-cost claimant buckets
 * - $200k+ (exceeding ISL)
 * - $100k-$200k (50%-100% of ISL)
 * - All Other
 */
export function calculateHighClaimantBuckets(
  highClaimants: HighClaimant[],
  totalPaidClaims: number
): HighClaimantBuckets {
  const over200k = highClaimants.filter((c) => c.totalPaid >= 200000);
  const between100kAnd200k = highClaimants.filter(
    (c) => c.totalPaid >= 100000 && c.totalPaid < 200000
  );

  const over200kTotal = over200k.reduce((sum, c) => sum + c.totalPaid, 0);
  const between100kAnd200kTotal = between100kAnd200k.reduce(
    (sum, c) => sum + c.totalPaid,
    0
  );
  const hccTotal = over200kTotal + between100kAnd200kTotal;
  const allOtherTotal = totalPaidClaims - hccTotal;

  const employerResponsibility = highClaimants.reduce((sum, c) => {
    return sum + Math.min(c.totalPaid, c.islLimit);
  }, 0);

  const stopLossReimbursement = highClaimants.reduce((sum, c) => {
    return sum + c.amountExceedingISL;
  }, 0);

  return {
    over200k: {
      count: over200k.length,
      totalPaid: over200kTotal,
      percentOfTotal: totalPaidClaims > 0 ? (over200kTotal / totalPaidClaims) * 100 : 0,
    },
    between100kAnd200k: {
      count: between100kAnd200k.length,
      totalPaid: between100kAnd200kTotal,
      percentOfTotal:
        totalPaidClaims > 0 ? (between100kAnd200kTotal / totalPaidClaims) * 100 : 0,
    },
    allOther: {
      totalPaid: allOtherTotal,
      percentOfTotal: totalPaidClaims > 0 ? (allOtherTotal / totalPaidClaims) * 100 : 0,
    },
    employerResponsibility,
    stopLossReimbursement,
  };
}

/**
 * Filter claimants that meet HCC threshold (≥50% of ISL)
 */
export function filterHighCostClaimants(
  claimants: HighClaimant[],
  islLimit: number
): HighClaimant[] {
  const threshold = islLimit * 0.5; // 50% of ISL (e.g., $100,000 for $200k ISL)
  return claimants.filter((c) => c.totalPaid >= threshold);
}

// ============================================================================
// COMPLETE FORMULA ENGINE
// ============================================================================

/**
 * Main formula engine: compute all metrics from inputs
 */
export function calculateAllMetrics(input: FormulaInput): FormulaOutput {
  const { monthlyStats, planYear, highClaimants } = input;

  // Calculate complete monthly stats with formulas
  const calculatedMonthlyStats = monthlyStats.map((m) => calculateMonthlyStats(m));

  // Calculate PEPM for different periods
  // Note: This assumes monthlyStats are sorted by date; in production,
  // you'd filter by actual date ranges
  const currentPY = calculatePEPM(calculatedMonthlyStats, 'Current PY');
  const priorPY = createEmptyPEPM('Prior PY'); // Would filter prior year data
  const current12 = calculatePEPM(
    calculatedMonthlyStats.slice(-12),
    'Current 12'
  );
  const prior12 = createEmptyPEPM('Prior 12'); // Would filter prior 12 months

  // Executive summary
  const executiveSummary = calculateExecutiveSummaryKPIs(
    calculatedMonthlyStats,
    planYear,
    new Date().toISOString().split('T')[0]
  );

  // Fuel gauge
  const fuelGauge = calculateFuelGauge(executiveSummary.percentOfBudget);

  // Distribution insights
  const medicalVsRx = calculateMedicalVsRxDistribution(
    executiveSummary.medicalPaidClaims,
    executiveSummary.pharmacyPaidClaims
  );

  // Plan mix (would aggregate by plan in production)
  const planMix: DistributionInsights['planMix'] = [];

  // High-cost claimant analysis
  const filteredHCC = filterHighCostClaimants(highClaimants, planYear.islLimit);
  const highClaimantBuckets = calculateHighClaimantBuckets(
    filteredHCC,
    executiveSummary.totalPaidClaims
  );

  const distributionInsights: DistributionInsights = {
    medicalVsRx,
    planMix,
    highCostBuckets: highClaimantBuckets,
  };

  return {
    executiveSummary,
    monthlyStats: calculatedMonthlyStats,
    pepmCalculations: {
      currentPY,
      priorPY,
      current12,
      prior12,
    },
    distributionInsights,
    highClaimantBuckets,
    fuelGauge,
  };
}

// ============================================================================
// VALIDATION & RECONCILIATION
// ============================================================================

/**
 * Validate that per-plan totals reconcile to "All Plans" totals
 */
export function validateReconciliation(
  allPlansStats: MonthlyPlanStats,
  perPlanStats: MonthlyPlanStats[],
  tolerance: number = 0
): boolean {
  const sumMedical = perPlanStats.reduce((sum, p) => sum + p.medicalClaims, 0);
  const sumRx = perPlanStats.reduce((sum, p) => sum + p.pharmacyClaims, 0);
  const sumAdminFees = perPlanStats.reduce((sum, p) => sum + p.adminFees, 0);
  const sumStopLoss = perPlanStats.reduce((sum, p) => sum + p.stopLossFees, 0);

  const medicalDiff = Math.abs(allPlansStats.medicalClaims - sumMedical);
  const rxDiff = Math.abs(allPlansStats.pharmacyClaims - sumRx);
  const adminDiff = Math.abs(allPlansStats.adminFees - sumAdminFees);
  const stopLossDiff = Math.abs(allPlansStats.stopLossFees - sumStopLoss);

  return (
    medicalDiff <= tolerance &&
    rxDiff <= tolerance &&
    adminDiff <= tolerance &&
    stopLossDiff <= tolerance
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency (for display)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage (for display)
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
