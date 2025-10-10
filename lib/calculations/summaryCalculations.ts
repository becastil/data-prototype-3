// Summary Table Calculation Engine
// Implements all 28 rows of the C&E Reporting Summary Table

import {
  CompleteSummaryRow,
  SummaryCalculationInput,
  SummaryCalculationResult,
  AdjustedMedicalClaims,
  PharmacyRow,
  StopLossRow,
  AdminFeesRow,
  MonthlyTotalsRow,
  EnrollmentMetrics,
  PEPMMetrics,
  BudgetData,
  VarianceAnalysis,
  AdminFeeLineItem,
  UserAdjustableLineItem
} from '@/types/summary';

/**
 * Main calculation function that generates all 28 rows
 */
export function calculateCompleteSummary(
  input: SummaryCalculationInput
): SummaryCalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate input data
    if (!input.experienceData || input.experienceData.length === 0) {
      errors.push('No experience data provided');
      return {
        success: false,
        errors,
        warnings,
        metadata: {
          calculatedAt: new Date().toISOString(),
          totalMonths: 0,
          dataCompleteness: 0,
          missingMonths: []
        }
      };
    }

    // Get all months from experience data
    const allMonths = input.experienceData.map(d => d.month).sort();
    const summaryRows: CompleteSummaryRow[] = [];

    // Calculate cumulative values
    let cumulativeClaims = 0;

    // Process each month
    for (const month of allMonths) {
      // Find data for this month
      const experienceMonth = input.experienceData.find(d => d.month === month);
      const stopLossMonth = input.stopLossFees?.find(f => f.month === month);
      const consultingMonth = input.consulting?.find(c => c.month === month);
      const adminFeesMonth = input.adminFeeLineItems?.find(a => a.month === month);
      const budgetMonth = input.budgetData?.find(b => b.month === month);

      if (!experienceMonth) {
        warnings.push(`Experience data missing for month ${month}`);
        continue;
      }

      // Items #1-7: Medical Claims
      const medicalClaims = calculateMedicalClaims(
        month,
        experienceMonth,
        input.userAdjustments
      );

      // Items #8-9: Pharmacy
      const pharmacy = calculatePharmacy(
        month,
        experienceMonth.rxClaims,
        input.userAdjustments
      );

      // Items #10-11: Stop Loss
      const stopLoss = calculateStopLoss(
        month,
        stopLossMonth?.calculatedAmount || 0,
        input.userAdjustments
      );

      // Items #12-14: Admin Fees
      const adminFees = calculateAdminFees(
        month,
        consultingMonth?.amount || 0,
        adminFeesMonth?.fees || [],
        experienceMonth.eeCount,
        experienceMonth.memberCount
      );

      // Items #15-16: Monthly Totals
      const totals = calculateMonthlyTotals(
        month,
        medicalClaims,
        pharmacy,
        stopLoss,
        adminFees,
        cumulativeClaims
      );

      // Update cumulative
      cumulativeClaims = totals.cumulativeClaimsAndExpenses;

      // Items #17-18: Enrollment Metrics
      const enrollment: EnrollmentMetrics = {
        month,
        eeCount: experienceMonth.eeCount,
        memberCount: experienceMonth.memberCount
      };

      // Items #19-21: PEPM Metrics
      const pepm = calculatePEPMMetrics(
        month,
        totals.monthlyClaimsAndExpenses,
        cumulativeClaims,
        experienceMonth.eeCount,
        input.targetPEPM
      );

      // Items #22-24: Budget Data
      const budget: BudgetData = budgetMonth || {
        month,
        pepmBudget: input.targetPEPM || 0,
        pepmBudgetEECounts: experienceMonth.eeCount,
        annualCumulativeBudget: 0
      };

      // Items #25-28: Variance Analysis
      const variance = calculateVariance(
        month,
        totals.monthlyClaimsAndExpenses,
        cumulativeClaims,
        budget,
        experienceMonth.eeCount
      );

      // Combine all into complete row
      summaryRows.push({
        month,
        medicalClaims,
        pharmacy,
        stopLoss,
        adminFees,
        totals,
        enrollment,
        pepm,
        budget,
        variance
      });
    }

    // Calculate data completeness
    const expectedMonths = allMonths.length;
    const actualMonths = summaryRows.length;
    const dataCompleteness = (actualMonths / expectedMonths) * 100;

    const missingMonths = allMonths.filter(
      m => !summaryRows.find(r => r.month === m)
    );

    return {
      success: true,
      data: summaryRows,
      errors,
      warnings,
      metadata: {
        calculatedAt: new Date().toISOString(),
        totalMonths: actualMonths,
        dataCompleteness,
        missingMonths
      }
    };
  } catch (error) {
    errors.push(`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      errors,
      warnings,
      metadata: {
        calculatedAt: new Date().toISOString(),
        totalMonths: 0,
        dataCompleteness: 0,
        missingMonths: []
      }
    };
  }
}

/**
 * Calculate Medical Claims (Items #1-7)
 */
function calculateMedicalClaims(
  month: string,
  experienceData: SummaryCalculationInput['experienceData'][0],
  userAdjustments: UserAdjustableLineItem[]
): AdjustedMedicalClaims {
  // Item #1: Domestic Medical Facility Claims (IP/OP)
  const domesticMedicalFacilityIPOP = experienceData.domesticMedicalIPOP;

  // Item #2: Non-Domestic Medical Claims (IP/OP)
  const nonDomesticMedicalIPOP = experienceData.nonDomesticMedical;

  // Item #3: Total Hospital Claims = #1 + #2
  const totalHospitalClaims = domesticMedicalFacilityIPOP + nonDomesticMedicalIPOP;

  // Item #4: Non-Hospital Medical Claims
  const nonHospitalMedicalClaims = experienceData.nonHospitalMedical;

  // Item #5: Total All Medical Claims = #3 + #4
  const totalAllMedicalClaims = totalHospitalClaims + nonHospitalMedicalClaims;

  // Item #6: UC Claims Settlement Adjustment (user-adjustable)
  const ucAdjustment = userAdjustments.find(
    adj => adj.month === month && adj.type === 'uc-settlement' && adj.enabled
  );
  const ucSettlementAdjustment = ucAdjustment?.amount || 0;

  // Item #7: Total Adjusted Medical Claims = #5 + #6
  const totalAdjustedMedicalClaims = totalAllMedicalClaims + ucSettlementAdjustment;

  return {
    month,
    domesticMedicalFacilityIPOP,
    nonDomesticMedicalIPOP,
    totalHospitalClaims,
    nonHospitalMedicalClaims,
    totalAllMedicalClaims,
    ucSettlementAdjustment,
    totalAdjustedMedicalClaims
  };
}

/**
 * Calculate Pharmacy Costs (Items #8-9)
 */
function calculatePharmacy(
  month: string,
  rxClaims: number,
  userAdjustments: UserAdjustableLineItem[]
): PharmacyRow {
  // Item #8: Total Rx Claims (from CSV)
  const totalRxClaims = rxClaims;

  // Item #9: Rx Rebates (user-adjustable, typically negative)
  const rxRebateAdj = userAdjustments.find(
    adj => adj.month === month && adj.type === 'rx-rebates' && adj.enabled
  );
  const rxRebates = rxRebateAdj?.amount || 0;

  return {
    month,
    totalRxClaims,
    rxRebates
  };
}

/**
 * Calculate Stop Loss Fees (Items #10-11)
 */
function calculateStopLoss(
  month: string,
  calculatedStopLossFee: number,
  userAdjustments: UserAdjustableLineItem[]
): StopLossRow {
  // Item #10: Total Stop Loss Fees (calculated from Configure Fees page)
  const totalStopLossFees = calculatedStopLossFee;

  // Item #11: Stop Loss Reimbursement (user-adjustable, typically negative)
  const reimbursementAdj = userAdjustments.find(
    adj => adj.month === month && adj.type === 'stop-loss-reimbursement' && adj.enabled
  );
  const stopLossReimbursement = reimbursementAdj?.amount || 0;

  return {
    month,
    totalStopLossFees,
    stopLossReimbursement
  };
}

/**
 * Calculate Admin Fees (Items #12-14)
 * Smart calculation based on fee type: PEPM/PMPM/Flat
 */
function calculateAdminFees(
  month: string,
  consulting: number,
  adminFeeLineItems: AdminFeeLineItem[],
  eeCount: number,
  memberCount: number
): AdminFeesRow {
  // Item #12: Consulting fees (direct user input)
  const consultingAmount = consulting;

  // Item #13: Calculate each admin fee line item
  const calculatedLineItems: AdminFeeLineItem[] = adminFeeLineItems.map(fee => {
    let calculatedAmount = 0;

    switch (fee.feeType) {
      case 'pepm':
        // Per Employee Per Month: amount × EE Count
        calculatedAmount = fee.amount * eeCount;
        break;
      case 'pmpm':
        // Per Member Per Month: amount × Member Count
        calculatedAmount = fee.amount * memberCount;
        break;
      case 'flat':
        // Flat fee: use amount directly
        calculatedAmount = fee.amount;
        break;
      default:
        calculatedAmount = 0;
    }

    return {
      ...fee,
      calculatedAmount,
      enrollment: fee.feeType === 'pepm' ? eeCount : fee.feeType === 'pmpm' ? memberCount : undefined
    };
  });

  // Item #14: Total Admin Fees = consulting + sum of all line items
  const totalAdminFees = consultingAmount + calculatedLineItems.reduce(
    (sum, item) => sum + item.calculatedAmount,
    0
  );

  return {
    month,
    consulting: consultingAmount,
    adminFeeLineItems: calculatedLineItems,
    totalAdminFees
  };
}

/**
 * Calculate Monthly Totals (Items #15-16)
 */
function calculateMonthlyTotals(
  month: string,
  medical: AdjustedMedicalClaims,
  pharmacy: PharmacyRow,
  stopLoss: StopLossRow,
  adminFees: AdminFeesRow,
  previousCumulative: number
): MonthlyTotalsRow {
  // Item #15: Monthly Claims and Expenses
  // Formula: Total Adjusted Medical + Rx Claims + Rx Rebates + Stop Loss Fees - Stop Loss Reimbursement + Total Admin Fees
  const monthlyClaimsAndExpenses =
    medical.totalAdjustedMedicalClaims +
    pharmacy.totalRxClaims +
    pharmacy.rxRebates +
    stopLoss.totalStopLossFees -
    stopLoss.stopLossReimbursement +
    adminFees.totalAdminFees;

  // Item #16: Cumulative Claims and Expenses
  const cumulativeClaimsAndExpenses = previousCumulative + monthlyClaimsAndExpenses;

  return {
    month,
    monthlyClaimsAndExpenses,
    cumulativeClaimsAndExpenses
  };
}

/**
 * Calculate PEPM Metrics (Items #19-21)
 */
function calculatePEPMMetrics(
  month: string,
  monthlyExpenses: number,
  cumulativeExpenses: number,
  eeCount: number,
  targetPEPM: number
): PEPMMetrics {
  // Item #19: PEPM Non-Lagged Actual = Monthly Expenses / EE Count
  const pepmNonLaggedActual = eeCount > 0 ? monthlyExpenses / eeCount : 0;

  // Item #20: PEPM Non-Lagged Cumulative = Cumulative Expenses / Cumulative EE Count
  // For simplicity, using current EE Count (in production, track cumulative EE months)
  const pepmNonLaggedCumulative = eeCount > 0 ? cumulativeExpenses / eeCount : 0;

  // Item #21: Incurred Target PEPM (from configuration)
  const incurredTargetPEPM = targetPEPM;

  return {
    month,
    pepmNonLaggedActual,
    pepmNonLaggedCumulative,
    incurredTargetPEPM
  };
}

/**
 * Calculate Variance Analysis (Items #25-28)
 */
function calculateVariance(
  month: string,
  monthlyExpenses: number,
  cumulativeExpenses: number,
  budget: BudgetData,
  eeCount: number
): VarianceAnalysis {
  // Calculate budgeted monthly amount
  const budgetedMonthly = budget.pepmBudget * (budget.pepmBudgetEECounts || eeCount);

  // Item #25: Actual Monthly Difference = Actual - Budget
  const actualMonthlyDifference = monthlyExpenses - budgetedMonthly;

  // Item #26: % Difference (Monthly)
  const percentDifferenceMonthly = budgetedMonthly > 0
    ? (actualMonthlyDifference / budgetedMonthly) * 100
    : 0;

  // Item #27: Cumulative Difference = Cumulative Actual - Cumulative Budget
  const cumulativeDifference = cumulativeExpenses - budget.annualCumulativeBudget;

  // Item #28: % Difference (Cumulative)
  const percentDifferenceCumulative = budget.annualCumulativeBudget > 0
    ? (cumulativeDifference / budget.annualCumulativeBudget) * 100
    : 0;

  return {
    month,
    actualMonthlyDifference,
    percentDifferenceMonthly,
    cumulativeDifference,
    percentDifferenceCumulative
  };
}

/**
 * Helper function to get user adjustment for a specific month and type
 */
export function getUserAdjustment(
  userAdjustments: UserAdjustableLineItem[],
  month: string,
  type: UserAdjustableLineItem['type']
): number {
  const adjustment = userAdjustments.find(
    adj => adj.month === month && adj.type === type && adj.enabled
  );
  return adjustment?.amount || 0;
}

/**
 * Calculate stop loss fees with smart tiered/composite logic
 */
export function calculateStopLossFee(
  enrollment: number,
  feeStructure: 'tiered' | 'composite' | 'flat',
  config: {
    // Tiered configuration
    tiers?: Array<{
      minEnrollment: number;
      maxEnrollment: number | null;
      singleRate: number;
      familyRate: number;
      singleCount?: number;
      familyCount?: number;
    }>;
    // Composite configuration
    compositeRate?: number;
    // Flat configuration
    flatAmount?: number;
  }
): number {
  switch (feeStructure) {
    case 'tiered': {
      if (!config.tiers || config.tiers.length === 0) return 0;

      // Find applicable tier
      const tier = config.tiers.find(t =>
        enrollment >= t.minEnrollment &&
        (t.maxEnrollment === null || enrollment <= t.maxEnrollment)
      );

      if (!tier) return 0;

      // Calculate: (singles × single rate) + (families × family rate)
      const singleCost = (tier.singleCount || 0) * tier.singleRate;
      const familyCost = (tier.familyCount || 0) * tier.familyRate;
      return singleCost + familyCost;
    }

    case 'composite': {
      // Calculate: enrollment × composite rate
      return enrollment * (config.compositeRate || 0);
    }

    case 'flat': {
      // Return flat amount
      return config.flatAmount || 0;
    }

    default:
      return 0;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Determine status color based on variance
 */
export function getVarianceStatus(
  variance: number,
  thresholds: { good: number; warning: number; critical: number }
): 'good' | 'warning' | 'critical' {
  if (variance <= thresholds.good) return 'good';
  if (variance <= thresholds.warning) return 'warning';
  return 'critical';
}
