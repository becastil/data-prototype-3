// Summary Table Types
// Comprehensive type definitions for the 28-row C&E Reporting Summary Table

/**
 * User-adjustable line items that can be added/removed per month
 * Used for items #6 (UC Claims Settlement), #9 (Rx Rebates), #11 (Stop Loss Reimbursement)
 */
export interface UserAdjustableLineItem {
  id: string;
  type: 'uc-settlement' | 'rx-rebates' | 'stop-loss-reimbursement';
  month: string; // YYYY-MM format
  amount: number; // Can be positive or negative
  description?: string;
  enabled: boolean; // Show/hide toggle
  createdAt: string;
  updatedAt: string;
}

/**
 * Medical claims data from uploaded CSV (Items #1-5)
 */
export interface MedicalClaimsRow {
  month: string;
  domesticMedicalFacilityIPOP: number; // Item #1: Domestic Medical Facility Claims (IP/OP)
  nonDomesticMedicalIPOP: number;      // Item #2: Non-Domestic Medical Claims (IP/OP)
  totalHospitalClaims: number;         // Item #3: Sum of #1 and #2
  nonHospitalMedicalClaims: number;    // Item #4: Non-Hospital Medical Claims
  totalAllMedicalClaims: number;       // Item #5: Sum of #3 and #4
}

/**
 * Adjusted medical claims with user adjustments (Items #6-7)
 */
export interface AdjustedMedicalClaims extends MedicalClaimsRow {
  ucSettlementAdjustment: number;      // Item #6: UC Claims Settlement Adjustment
  totalAdjustedMedicalClaims: number;  // Item #7: Sum of #5 and #6
}

/**
 * Pharmacy data (Items #8-9)
 */
export interface PharmacyRow {
  month: string;
  totalRxClaims: number;               // Item #8: Total Rx Claims (from CSV)
  rxRebates: number;                   // Item #9: Rx Rebates (user-adjustable)
}

/**
 * Stop Loss data (Items #10-11)
 */
export interface StopLossRow {
  month: string;
  totalStopLossFees: number;           // Item #10: Calculated from Configure Fees
  stopLossReimbursement: number;       // Item #11: User-adjustable reimbursements
}

/**
 * Administrative fees from Configure Fees page (Items #12-14)
 */
export interface AdminFeesRow {
  month: string;
  consulting: number;                  // Item #12: Consulting fees (user-entered)
  adminFeeLineItems: AdminFeeLineItem[]; // Item #13: Individual admin fee categories
  totalAdminFees: number;              // Item #14: Sum of all admin fees including consulting
}

/**
 * Individual admin fee line item with smart calculation
 */
export interface AdminFeeLineItem {
  id: string;
  name: string; // e.g., "TPA Claims/COBRA Administration Fee (PEPM)"
  feeType: 'pepm' | 'pmpm' | 'flat';
  amount: number; // Base amount
  calculatedAmount: number; // Calculated based on feeType
  enrollment?: number; // EE Count for PEPM, Member Count for PMPM
  description?: string;
}

/**
 * Monthly totals (Items #15-16)
 */
export interface MonthlyTotalsRow {
  month: string;
  monthlyClaimsAndExpenses: number;    // Item #15: Total of medical + Rx + rebates + stop loss - reimbursement + admin + consulting
  cumulativeClaimsAndExpenses: number; // Item #16: Running total across months
}

/**
 * Enrollment and member metrics (Items #17-18)
 */
export interface EnrollmentMetrics {
  month: string;
  eeCount: number;                     // Item #17: EE Count (Active & COBRA) from CSV
  memberCount: number;                 // Item #18: Member Count from CSV
}

/**
 * PEPM (Per Employee Per Month) metrics (Items #19-21)
 */
export interface PEPMMetrics {
  month: string;
  pepmNonLaggedActual: number;         // Item #19: Actual PEPM cost
  pepmNonLaggedCumulative: number;     // Item #20: Cumulative PEPM
  incurredTargetPEPM: number;          // Item #21: Target cost per employee
}

/**
 * Budget analysis data (Items #22-24)
 */
export interface BudgetData {
  month: string;
  pepmBudget: number;                  // Item #22: 2024-2025 PEPM Budget (with 0% Margin)
  pepmBudgetEECounts: number;          // Item #23: Budgeted employee counts
  annualCumulativeBudget: number;      // Item #24: Year-to-date budget total
}

/**
 * Variance analysis (Items #25-28)
 */
export interface VarianceAnalysis {
  month: string;
  actualMonthlyDifference: number;     // Item #25: Actual - Budget (monthly)
  percentDifferenceMonthly: number;    // Item #26: % variance (monthly)
  cumulativeDifference: number;        // Item #27: Cumulative actual - cumulative budget
  percentDifferenceCumulative: number; // Item #28: % variance (cumulative)
}

/**
 * Complete summary table row (all 28 items combined)
 */
export interface CompleteSummaryRow {
  month: string;

  // Medical Claims (Items #1-7)
  medicalClaims: AdjustedMedicalClaims;

  // Pharmacy (Items #8-9)
  pharmacy: PharmacyRow;

  // Stop Loss (Items #10-11)
  stopLoss: StopLossRow;

  // Admin Fees (Items #12-14)
  adminFees: AdminFeesRow;

  // Totals (Items #15-16)
  totals: MonthlyTotalsRow;

  // Enrollment (Items #17-18)
  enrollment: EnrollmentMetrics;

  // PEPM Metrics (Items #19-21)
  pepm: PEPMMetrics;

  // Budget (Items #22-24)
  budget: BudgetData;

  // Variance (Items #25-28)
  variance: VarianceAnalysis;
}

/**
 * Summary table configuration
 */
export interface SummaryTableConfig {
  showUserAdjustments: boolean;        // Show/hide adjustment rows
  colorCoding: {
    goodThreshold: number;             // Green if below (e.g., 0.85 for 85% loss ratio)
    warningThreshold: number;          // Yellow between good and critical
    criticalThreshold: number;         // Red if above (e.g., 1.0 for 100% loss ratio)
  };
  viewMode: 'monthly' | 'quarterly' | 'annual';
  selectedMonths: string[];            // Filter to specific months
}

/**
 * Summary calculation input data
 */
export interface SummaryCalculationInput {
  // From CSV upload
  experienceData: {
    month: string;
    domesticMedicalIPOP: number;
    nonDomesticMedical: number;
    nonHospitalMedical: number;
    rxClaims: number;
    eeCount: number;
    memberCount: number;
  }[];

  // From Configure Fees
  stopLossFees: {
    month: string;
    calculatedAmount: number;
    feeStructure: 'tiered' | 'composite' | 'flat';
  }[];

  consulting: {
    month: string;
    amount: number;
  }[];

  adminFeeLineItems: {
    month: string;
    fees: AdminFeeLineItem[];
  }[];

  // User adjustments
  userAdjustments: UserAdjustableLineItem[];

  // Budget data
  budgetData: BudgetData[];

  // Target metrics
  targetLossRatio: number;
  targetPEPM: number;
}

/**
 * Summary calculation result
 */
export interface SummaryCalculationResult {
  success: boolean;
  data?: CompleteSummaryRow[];
  errors?: string[];
  warnings?: string[];
  metadata: {
    calculatedAt: string;
    totalMonths: number;
    dataCompleteness: number; // Percentage (0-100)
    missingMonths: string[];
  };
}

/**
 * Export configuration for Summary Table
 */
export interface SummaryExportConfig {
  format: 'csv' | 'pdf' | 'excel';
  includeCharts: boolean;
  includeMetadata: boolean;
  selectedRows: number[]; // Row numbers to include (1-28)
  dateRange: {
    start: string;
    end: string;
  };
  orientation?: 'landscape' | 'portrait';
  filename?: string;
}

/**
 * Summary table filters
 */
export interface SummaryTableFilters {
  monthRange?: {
    start: string;
    end: string;
  };
  showOnlyWithAdjustments?: boolean;
  highlightVariances?: boolean;
  groupBy?: 'none' | 'quarter' | 'year';
}

/**
 * Calculation breakdown for transparency
 */
export interface CalculationBreakdown {
  rowNumber: number;
  rowName: string;
  formula: string;
  inputValues: Record<string, number>;
  result: number;
  dataSource: 'csv' | 'fees' | 'adjustment' | 'calculated';
  notes?: string;
}
