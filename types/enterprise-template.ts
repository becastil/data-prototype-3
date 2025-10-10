/**
 * Enterprise Medical/Rx Reporting Template Types
 * Matches "Medical-Rx Experience Report Template (2025.10.02).pdf"
 *
 * This file defines the complete data model for multi-plan, rolling 24-month
 * healthcare reporting with executive dashboards, high-cost claimant tracking,
 * and plan-specific analytics.
 */

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Client (tenant) entity
 */
export interface Client {
  id: string;
  name: string;
  active: boolean;
  cadence: ReportingCadence;
  createdAt: string;
  updatedAt: string;
}

export type ReportingCadence = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';

/**
 * Plan types matching the template
 */
export type PlanType = 'HDHP' | 'PPO_BASE' | 'PPO_BUYUP' | 'HMO_1' | 'HMO_2' | 'HMO_3' | 'HMO_4' | 'HMO_5';

/**
 * Plan entity
 */
export interface Plan {
  id: string;
  clientId: string;
  name: string; // e.g., "HDHP", "PPO Base", "PPO Buy-Up"
  type: PlanType;
  active: boolean;
  effectiveDate: string;
  terminationDate?: string;
}

/**
 * Plan enrollment tiers (matches template inputs page 8)
 */
export type EnrollmentTier = 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY';

export interface PlanTier {
  id: string;
  planId: string;
  tier: EnrollmentTier;
  label: string; // e.g., "Employee Only", "Employee + Spouse"
}

/**
 * Plan Year tracking
 */
export interface PlanYear {
  id: string;
  clientId: string;
  yearLabel: string; // e.g., "2024", "2024-2025"
  startDate: string; // ISO date: "2024-07-01"
  endDate: string;   // ISO date: "2025-06-30"
  islLimit: number;  // Individual Stop Loss limit (default $200,000)
  hccThreshold: number; // High Cost Claimant threshold (default 50% of ISL = $100,000)
  budgetPEPM: number; // Annual target PEPM
  active: boolean;
}

/**
 * Month Snapshot - represents one reporting month
 */
export interface MonthSnapshot {
  id: string;
  clientId: string;
  planYearId: string;
  monthDate: string; // First day of month: "2025-06-01"
  dataThrough: string; // Same as monthDate for finalized months
  locked: boolean; // Prevent edits after finalization
}

// ============================================================================
// MONTHLY PLAN STATISTICS (Template Pages 3, 5-7)
// ============================================================================

/**
 * Monthly statistics per plan (columns A-N from template)
 * Matches the "Monthly Detail" tables on pages 3, 5, 6, 7
 */
export interface MonthlyPlanStats {
  id: string;
  monthSnapshotId: string;
  planId: string; // or "ALL_PLANS" for combined view

  // Column A: Month (handled by MonthSnapshot)

  // Column B: Total Subscribers
  totalSubscribers: number;

  // Enrollment by tier (for fee calculations)
  enrollmentByTier: Record<EnrollmentTier, number>;

  // Column C: Medical Claims
  medicalClaims: number;

  // Column D: Pharmacy Claims
  pharmacyClaims: number;

  // Column E: Gross Medical & Pharmacy Claims (C + D)
  grossMedicalPharmacyClaims: number;

  // Column F: Spec Stop Loss Reimb (negative reduces claims)
  specStopLossReimb: number;

  // Column G: Estimated Earned Pharmacy Rebates (negative accrual)
  estimatedRxRebates: number;

  // Column H: Net Medical & Pharmacy Claims (E + F + G)
  netMedicalPharmacyClaims: number;

  // Column I: Admin Fees
  adminFees: number;

  // Column J: Stop Loss Fees
  stopLossFees: number;

  // Column K: Total Plan Cost (H + I + J)
  totalPlanCost: number;

  // Column L: Budgeted Premium
  budgetedPremium: number;

  // Column M: Surplus/(Deficit) (L - K)
  surplusDeficit: number;

  // Column N: % of Budget (K / L)
  percentOfBudget: number;
}

/**
 * Aggregated view for "All Plans" combined
 */
export type AllPlansMonthlyStats = MonthlyPlanStats & {
  planId: 'ALL_PLANS';
};

// ============================================================================
// HIGH COST CLAIMANTS (Template Page 4)
// ============================================================================

export type ClaimantStatus = 'ACTIVE' | 'COBRA' | 'RETIRED' | 'TERMINATED' | 'UNKNOWN';

/**
 * High Cost Claimant tracking (≥50% of ISL)
 */
export interface HighClaimant {
  id: string;
  clientId: string;
  planYearId: string;
  claimantKey: string; // Hashed identifier (not PHI)
  planId: string;
  status: ClaimantStatus;
  primaryDiagnosis: string;
  medicalPaid: number;
  rxPaid: number;
  totalPaid: number; // medicalPaid + rxPaid
  islLimit: number; // From PlanYear
  amountExceedingISL: number; // max(0, totalPaid - islLimit)
  recognized: boolean; // Whether stop loss reimb is recognized
}

/**
 * Summary of high-cost claimant buckets
 */
export interface HighClaimantBuckets {
  over200k: {
    count: number;
    totalPaid: number;
    percentOfTotal: number;
  };
  between100kAnd200k: {
    count: number;
    totalPaid: number;
    percentOfTotal: number;
  };
  allOther: {
    totalPaid: number;
    percentOfTotal: number;
  };
  employerResponsibility: number;
  stopLossReimbursement: number;
}

// ============================================================================
// CONFIGURATION INPUTS (Template Page 8)
// ============================================================================

/**
 * Premium Equivalent rates by plan and tier
 */
export interface PremiumEquivalent {
  id: string;
  planId: string;
  tierId: string;
  planYearId: string;
  amount: number; // Monthly premium equivalent
  effectiveDate: string;
}

/**
 * Admin Fee Component (e.g., ASO Fee, Network Access Fee, etc.)
 */
export interface AdminFeeComponent {
  id: string;
  planId: string; // or "ALL_PLANS"
  planYearId: string;
  label: string; // e.g., "ASO Fee", "External Stop Loss Coordination Fee"
  amountPEPM: number; // Per employee per month
  effectiveDate: string;
}

/**
 * Stop Loss Fees by tier and type
 */
export interface StopLossFeeByTier {
  id: string;
  planId: string;
  tierId: string;
  planYearId: string;
  islFee: number; // Individual Stop Loss fee
  aslFee: number; // Aggregate Stop Loss fee
  effectiveDate: string;
}

/**
 * Global inputs for calculations
 */
export interface GlobalInputs {
  id: string;
  clientId: string;
  planYearId: string;
  rxRebatePEPMEstimate: number; // e.g., -$75.00 prior PY, -$85.00 current PY
  ibnrAdjustment: number; // Incurred But Not Reported adjustment
  stopLossTrackingMode: 'BY_PLAN' | 'AGGREGATED';
  aslCompositeFactor: number; // e.g., $1,200.00 per employee
  effectiveDate: string;
}

// ============================================================================
// EXECUTIVE SUMMARY METRICS (Template Page 2)
// ============================================================================

/**
 * Executive Summary KPIs (Plan Year to Date)
 */
export interface ExecutiveSummaryKPIs {
  // Time period
  planYearLabel: string;
  dataThrough: string;

  // Budgeted vs Actual
  totalBudgetedPremium: number;
  budgetPEPM: number;

  // Claims
  medicalPaidClaims: number;
  pharmacyPaidClaims: number;
  totalPaidClaims: number;

  // Adjustments
  estStopLossReimb: number; // Negative
  estEarnedRxRebates: number; // Negative
  netPaidClaims: number;
  netPaidClaimsPEPM: number;

  // Fees
  administrationFees: number;
  stopLossFees: number;
  ibnrAdjustment: number;

  // Totals
  totalPlanCost: number;
  totalPlanCostPEPM: number;

  // Variance
  surplusDeficit: number;
  percentOfBudget: number; // For fuel gauge

  // Observations
  monthlyVsBudget: {
    under: number; // Count of months under budget
    on: number;    // Count of months on budget
    over: number;  // Count of months over budget
  };
}

/**
 * Fuel Gauge status based on % of budget
 */
export type FuelGaugeStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface FuelGaugeConfig {
  percentOfBudget: number;
  status: FuelGaugeStatus; // <95% = GREEN, 95-105% = YELLOW, >105% = RED
  color: string;
}

/**
 * Distribution insights (Med vs Rx, Plan mix, HCC buckets)
 */
export interface DistributionInsights {
  medicalVsRx: {
    medicalPercent: number; // e.g., 87%
    rxPercent: number;      // e.g., 13%
  };

  planMix: {
    planId: string;
    planName: string;
    paidClaims: number;
    percentOfTotal: number;
  }[];

  highCostBuckets: HighClaimantBuckets;
}

// ============================================================================
// PEPM CALCULATIONS
// ============================================================================

/**
 * PEPM (Per Employee Per Month) calculation results
 */
export interface PEPMCalculation {
  periodLabel: string; // e.g., "Current PY", "Prior PY", "Current 12", "Prior 12"
  memberMonths: number;
  averageSubscribers: number;

  medicalPEPM: number;
  rxPEPM: number;
  grossClaimsPEPM: number;
  netClaimsPEPM: number;
  adminFeesPEPM: number;
  stopLossFeesPEPM: number;
  totalPlanCostPEPM: number;
  budgetPEPM: number;

  variancePEPM: number;
  percentOfBudget: number;
}

/**
 * Rolling trends for PEPM (24 months)
 */
export interface PEPMTrends {
  current12: PEPMCalculation;
  prior12: PEPMCalculation;
  percentChange: {
    medical: number; // e.g., +5%
    rx: number;      // e.g., +25%
  };
}

// ============================================================================
// OBSERVATIONS & INSIGHTS
// ============================================================================

export interface ObservationNote {
  id: string;
  clientId: string;
  planYearId: string;
  monthSnapshotId?: string; // Optional: specific to a month
  text: string;
  autoGenerated: boolean;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auto-generated insight rules
 */
export interface InsightRule {
  condition: (data: ExecutiveSummaryKPIs) => boolean;
  message: (data: ExecutiveSummaryKPIs) => string;
}

// ============================================================================
// CSV UPLOAD & VALIDATION
// ============================================================================

/**
 * CSV upload payload for monthly combined data
 */
export interface MonthlyAllPlansCSV {
  Month: string; // "7/1/2024"
  'Total Subscribers': number;
  'Medical Claims': number;
  'Pharmacy Claims': number;
  'Spec Stop Loss Reimb': number; // May be negative
  'Estimated Earned Pharmacy Rebates': number; // Negative
  'Admin Fees': number;
  'Stop Loss Fees': number;
  'Budgeted Premium': number;
}

/**
 * CSV upload payload for monthly per-plan data
 */
export interface MonthlyPlanCSV extends MonthlyAllPlansCSV {
  Plan: PlanType;
}

/**
 * CSV upload payload for high-cost claimants
 */
export interface HighClaimantCSV {
  'Claimant #': number;
  Plan: PlanType;
  Status: ClaimantStatus;
  'Primary Diagnosis': string;
  'Medical Claims': number;
  'Rx Claims': number;
  'Total Claims': number;
  'Exceeding ISL': number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value: unknown;
}

export interface ValidationWarning {
  row: number;
  column: string;
  message: string;
  value: unknown;
}

/**
 * Reconciliation check (Σ per-plan vs All Plans)
 */
export interface ReconciliationCheck {
  month: string;
  allPlansTotal: number;
  perPlanTotal: number;
  difference: number;
  withinTolerance: boolean;
  tolerance: number; // Default $0 (exact match)
}

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * PDF export configuration matching template layout
 */
export interface PDFExportOptions {
  clientId: string;
  planYearId: string;
  throughMonth: string;

  includeCoverPage: boolean;
  includeExecutiveSummary: boolean;
  includeMonthlyDetail: boolean;
  includeHighCostClaimants: boolean;
  includePlanSpecificPages: boolean;
  includeInputsPage: boolean;

  orientation: 'landscape' | 'portrait';
  branding: {
    clientName: string;
    consultantName?: string; // e.g., "Keenan & Associates"
    consultantLicense?: string;
    consultantWebsite?: string;
  };
}

/**
 * PDF page templates
 */
export type PDFPageTemplate =
  | 'COVER'
  | 'EXECUTIVE_SUMMARY'
  | 'MONTHLY_DETAIL_ALL'
  | 'HIGH_COST_CLAIMANTS'
  | 'MONTHLY_DETAIL_PLAN'
  | 'INPUTS';

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * API endpoint types
 */
export interface UploadMonthlyAllRequest {
  clientId: string;
  planYearId: string;
  data: MonthlyAllPlansCSV[];
}

export interface UploadMonthlyPlanRequest {
  clientId: string;
  planYearId: string;
  planId: string;
  data: MonthlyPlanCSV[];
}

export interface UploadHighClaimantsRequest {
  clientId: string;
  planYearId: string;
  data: HighClaimantCSV[];
}

export interface GetExecutiveSummaryRequest {
  clientId: string;
  planYearId: string;
  through: string; // YYYY-MM
}

export interface GetMonthlyDetailRequest {
  clientId: string;
  planYearId: string;
  planId?: string; // Optional: specific plan or "ALL_PLANS"
  months?: number; // Default 24
}

export interface GetHighClaimantsRequest {
  clientId: string;
  planYearId: string;
}

export interface GetInputsRequest {
  clientId: string;
  planYearId: string;
}

export interface UpdateInputsRequest {
  clientId: string;
  planYearId: string;
  inputs: Partial<GlobalInputs>;
  premiumEquivalents?: Partial<PremiumEquivalent>[];
  adminFeeComponents?: Partial<AdminFeeComponent>[];
  stopLossFees?: Partial<StopLossFeeByTier>[];
}

/**
 * Generic API response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// ============================================================================
// FORMULA ENGINE TYPES
// ============================================================================

/**
 * Input for formula calculations
 */
export interface FormulaInput {
  monthlyStats: MonthlyPlanStats[];
  planYear: PlanYear;
  globalInputs: GlobalInputs;
  premiumEquivalents: PremiumEquivalent[];
  adminFeeComponents: AdminFeeComponent[];
  stopLossFees: StopLossFeeByTier[];
  highClaimants: HighClaimant[];
}

/**
 * Computed results from formula engine
 */
export interface FormulaOutput {
  executiveSummary: ExecutiveSummaryKPIs;
  monthlyStats: MonthlyPlanStats[];
  pepmCalculations: {
    currentPY: PEPMCalculation;
    priorPY: PEPMCalculation;
    current12: PEPMCalculation;
    prior12: PEPMCalculation;
  };
  distributionInsights: DistributionInsights;
  highClaimantBuckets: HighClaimantBuckets;
  fuelGauge: FuelGaugeConfig;
}

// ============================================================================
// AUDIT & SECURITY
// ============================================================================

export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER' | 'BROKER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  clientId: string; // Tenant scoping
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string; // e.g., "UPLOAD_DATA", "UPDATE_INPUTS", "EXPORT_PDF"
  entityType: string; // e.g., "MonthlyPlanStats", "GlobalInputs"
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// SEEDER DATA (Golden Sample Dataset)
// ============================================================================

/**
 * Golden Sample Dataset for "Flavio's Dog House" (template validation)
 */
export interface GoldenSampleDataset {
  client: Client;
  planYear: PlanYear;
  plans: Plan[];
  monthlyAllPlans: MonthlyAllPlansCSV[];
  monthlyByPlan: Record<PlanType, MonthlyPlanCSV[]>;
  highClaimants: HighClaimantCSV[];
  premiumEquivalents: PremiumEquivalent[];
  adminFeeComponents: AdminFeeComponent[];
  stopLossFees: StopLossFeeByTier[];
  globalInputs: GlobalInputs;

  // Expected outputs for validation
  expectedKPIs: {
    totalBudgetedPremium: 5585653;
    medicalPaidClaims: 4499969;
    pharmacyPaidClaims: 678522;
    totalPaidClaims: 5178492;
    estStopLossReimb: -563512;
    estEarnedRxRebates: -423675;
    netPaidClaims: 4191305;
    administrationFees: 258894;
    stopLossFees: 817983;
    ibnrAdjustment: 0;
    totalPlanCost: 5268182;
    surplusDeficit: 317471;
    percentOfBudget: 94.3;
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Date range for filtering
 */
export interface DateRange {
  start: string; // ISO date
  end: string;   // ISO date
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filter options for queries
 */
export interface FilterOptions {
  clientId?: string;
  planYearId?: string;
  planId?: string;
  dateRange?: DateRange;
  status?: ClaimantStatus;
  search?: string;
}
