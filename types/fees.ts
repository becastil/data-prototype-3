// Enhanced Fee Configuration Types
// Version 2.0 - Advanced fee structures with tiering, stacking, and segmentation

/**
 * Rate basis types for fee calculations
 */
export type RateBasis =
  | 'pmpm'              // Per Member Per Month
  | 'pepm'              // Per Employee Per Month
  | 'percent_premium'   // Percentage of Premium
  | 'percent_claims'    // Percentage of Claims
  | 'per_transaction'   // Per Transaction Fee
  | 'flat'              // Fixed Monthly Amount
  | 'blended'           // Combination (e.g., $100 + 2% of premium)
  | 'composite'         // Different rates for members vs dependents
  | 'manual';           // Manually entered total

/**
 * Fee type categories
 */
export type FeeCategory =
  | 'administrative'    // Admin/management fees
  | 'performance'       // Performance-based fees
  | 'addon'            // Optional add-on services
  | 'credit'           // Credits/offsets (negative)
  | 'adjustment';      // One-time adjustments

/**
 * Tier definition for enrollment-based pricing
 */
export interface FeeTier {
  id: string;
  minEnrollment: number;        // Minimum enrollment for this tier (inclusive)
  maxEnrollment: number | null; // Maximum enrollment (null = unlimited)
  rate: number;                 // Rate for this tier
  label?: string;               // User-friendly label (e.g., "Small Group")
  color?: string;               // Visual indicator color
}

/**
 * Blended rate components
 */
export interface BlendedRateComponent {
  type: 'fixed' | 'percent_premium' | 'percent_claims' | 'pmpm';
  value: number;
  label?: string;
}

/**
 * Composite rate for member vs dependent pricing
 */
export interface CompositeRate {
  memberRate: number;
  dependentRate: number;
  basis: 'pmpm' | 'flat';
}

/**
 * Rate constraints (caps and floors)
 */
export interface RateConstraints {
  minAmount?: number;      // Minimum fee amount (floor)
  maxAmount?: number;      // Maximum fee amount (cap)
  minPerMember?: number;   // Minimum per-member rate
  maxPerMember?: number;   // Maximum per-member rate
}

/**
 * Time-based modifiers
 */
export interface SeasonalModifier {
  id: string;
  name: string;
  months: number[];        // Array of month numbers (1-12)
  multiplier: number;      // Rate multiplier (e.g., 1.1 for 10% increase)
  description?: string;
}

/**
 * Auto-escalation schedule
 */
export interface EscalationSchedule {
  type: 'percentage' | 'fixed_amount';
  value: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate?: string;
  compounding?: boolean;   // For percentage escalation
}

/**
 * Conditional fee rules
 */
export interface FeeCondition {
  id: string;
  type: 'enrollment_threshold' | 'claims_threshold' | 'loss_ratio_threshold' | 'custom';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | [number, number]; // Single value or range for 'between'
  action: 'apply' | 'waive' | 'adjust';
  adjustmentValue?: number;         // For 'adjust' action
  description?: string;
}

/**
 * Segmentation criteria
 */
export interface FeeSegmentation {
  clientId?: string;          // Client-specific pricing
  productType?: 'HMO' | 'PPO' | 'EPO' | 'POS'; // Product differentiation
  geography?: string;         // State/region code
  industry?: string;          // Industry/sector code
  groupSize?: 'small' | 'medium' | 'large' | 'jumbo';
}

/**
 * Pro-rating configuration
 */
export interface ProRatingConfig {
  enabled: boolean;
  method: 'daily' | 'calendar_days' | 'business_days';
  roundingRule: 'up' | 'down' | 'nearest';
}

/**
 * Enhanced Fee Structure (v2)
 */
export interface FeeStructureV2 {
  // Core identification
  id: string;
  name: string;
  description?: string;
  category: FeeCategory;

  // Date range
  effectiveStartDate: string;  // YYYY-MM-DD
  effectiveEndDate?: string;   // YYYY-MM-DD (null = ongoing)

  // Rate configuration
  rateBasis: RateBasis;
  baseAmount?: number;         // For flat, pmpm, pepm rates
  percentage?: number;         // For percentage-based rates (0-100)
  blendedComponents?: BlendedRateComponent[]; // For blended rates
  compositeRate?: CompositeRate;              // For composite rates

  // Tiered pricing
  tiers?: FeeTier[];
  tieringEnabled: boolean;

  // Constraints
  constraints?: RateConstraints;

  // Modifiers
  seasonalModifiers?: SeasonalModifier[];
  escalationSchedule?: EscalationSchedule;

  // Conditional logic
  conditions?: FeeCondition[];

  // Segmentation
  segmentation?: FeeSegmentation;

  // Pro-rating
  proRating?: ProRatingConfig;

  // Audit fields
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version: number;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'archived';

  // Legacy compatibility
  legacyFeeId?: string;  // Link to old FeeStructure records
}

/**
 * Monthly fee instance (calculated from FeeStructureV2)
 */
export interface MonthlyFeeInstance {
  id: string;
  feeStructureId: string;
  month: string;              // YYYY-MM format

  // Input data
  enrollment: number;
  premiumAmount?: number;     // For percentage-based calculations
  claimsAmount?: number;      // For percentage-based calculations
  transactionCount?: number;  // For per-transaction fees
  memberCount?: number;       // For composite rates
  dependentCount?: number;    // For composite rates

  // Calculated results
  calculatedAmount: number;
  appliedTier?: FeeTier;
  appliedModifiers?: string[]; // IDs of applied modifiers
  proRatedAmount?: number;
  finalAmount: number;

  // Breakdown (for transparency)
  breakdown: {
    baseCalculation: number;
    tierAdjustment?: number;
    seasonalAdjustment?: number;
    constraintAdjustment?: number;
    proRatingAdjustment?: number;
    components?: { label: string; amount: number }[]; // For blended rates
  };

  // Metadata
  calculatedAt: string;
  notes?: string;
}

/**
 * Fee template for reusable configurations
 */
export interface FeeTemplate {
  id: string;
  name: string;
  description?: string;
  category: FeeCategory;
  isPublic: boolean;          // Shared across clients or private

  // Template configuration (omits dates, segmentation)
  rateBasis: RateBasis;
  baseAmount?: number;
  percentage?: number;
  blendedComponents?: BlendedRateComponent[];
  compositeRate?: CompositeRate;
  tiers?: Omit<FeeTier, 'id'>[];
  constraints?: RateConstraints;
  seasonalModifiers?: SeasonalModifier[];
  escalationSchedule?: Omit<EscalationSchedule, 'startDate' | 'endDate'>;
  conditions?: FeeCondition[];
  proRating?: ProRatingConfig;

  // Metadata
  createdAt: string;
  createdBy?: string;
  usageCount: number;
  tags?: string[];
}

/**
 * Fee approval workflow
 */
export interface FeeApproval {
  id: string;
  feeStructureId: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  comments?: { user: string; text: string; timestamp: string }[];
}

/**
 * Fee version history
 */
export interface FeeVersionHistory {
  id: string;
  feeStructureId: string;
  version: number;
  changes: { field: string; oldValue: any; newValue: any }[];
  changedBy: string;
  changedAt: string;
  changeReason?: string;
}

/**
 * Fee conflict detection result
 */
export interface FeeConflict {
  type: 'overlap' | 'gap' | 'duplicate' | 'invalid_tier' | 'constraint_violation';
  severity: 'error' | 'warning' | 'info';
  message: string;
  feeStructureIds: string[];
  affectedMonths?: string[];
  suggestedResolution?: string;
}

/**
 * Bulk fee operation
 */
export interface BulkFeeOperation {
  operation: 'create' | 'update' | 'delete' | 'copy' | 'apply_template';
  targetMonths: string[];      // Array of YYYY-MM strings
  templateId?: string;         // For apply_template operation
  sourceFeeId?: string;        // For copy operation
  updates?: Partial<FeeStructureV2>; // For update operation
  dryRun: boolean;             // Preview without committing
}

/**
 * Fee calculation request
 */
export interface FeeCalculationRequest {
  feeStructureId: string;
  month: string;
  enrollment: number;
  premiumAmount?: number;
  claimsAmount?: number;
  transactionCount?: number;
  memberCount?: number;
  dependentCount?: number;
}

/**
 * Fee calculation result
 */
export interface FeeCalculationResult {
  success: boolean;
  monthlyFeeInstance?: MonthlyFeeInstance;
  errors?: string[];
  warnings?: string[];
}

/**
 * Fee analytics summary
 */
export interface FeeAnalytics {
  period: { start: string; end: string };
  totalFees: number;
  avgFeePerMonth: number;
  avgFeePerMember: number;
  feesByCategory: { category: FeeCategory; amount: number; percentage: number }[];
  tierDistribution?: { tier: string; months: number; totalFees: number }[];
  trendData: { month: string; totalFees: number; enrollment: number; avgPerMember: number }[];
  projectedAnnualFees: number;
  variance: { planned: number; actual: number; difference: number; percentDiff: number };
}

/**
 * Fee comparison (for scenario modeling)
 */
export interface FeeComparison {
  id: string;
  name: string;
  scenarios: {
    id: string;
    name: string;
    feeStructures: FeeStructureV2[];
    projectedTotalFees: number;
    avgPerMember: number;
  }[];
  winner?: string; // Scenario ID with best outcome
  criteria: 'lowest_cost' | 'highest_revenue' | 'best_margin' | 'custom';
}

/**
 * Backward compatibility - map old FeeStructure to new
 */
export interface FeeStructureLegacy {
  id: string;
  month: string;
  feeType: 'flat' | 'pepm' | 'pmpm' | 'tiered' | 'annual' | 'manual';
  amount: number;
  enrollment?: number;
  calculatedTotal: number;
  effectiveDate: string;
  description?: string;
}

/**
 * Migration mapper
 */
export function migrateLegacyFee(legacy: FeeStructureLegacy): FeeStructureV2 {
  const now = new Date().toISOString();

  // Map old fee type to new rate basis
  const rateBasisMap: Record<string, RateBasis> = {
    'pmpm': 'pmpm',
    'pepm': 'pepm',
    'flat': 'flat',
    'tiered': 'pmpm', // Will enable tiering
    'annual': 'flat',
    'manual': 'manual'
  };

  const baseStructure: FeeStructureV2 = {
    id: `v2-${legacy.id}`,
    name: `${legacy.month} Fee`,
    description: legacy.description || `Migrated from legacy fee ${legacy.id}`,
    category: 'administrative',
    effectiveStartDate: legacy.effectiveDate,
    rateBasis: rateBasisMap[legacy.feeType] || 'manual',
    baseAmount: legacy.feeType === 'annual' ? legacy.amount / 12 : legacy.amount,
    tieringEnabled: legacy.feeType === 'tiered',
    createdAt: now,
    updatedAt: now,
    version: 1,
    status: 'active',
    legacyFeeId: legacy.id
  };

  // Add simple tiers if it was a tiered fee
  if (legacy.feeType === 'tiered') {
    baseStructure.tiers = [
      { id: 't1', minEnrollment: 0, maxEnrollment: 1000, rate: legacy.amount, label: 'Tier 1' },
      { id: 't2', minEnrollment: 1001, maxEnrollment: 1500, rate: legacy.amount * 0.95, label: 'Tier 2' },
      { id: 't3', minEnrollment: 1501, maxEnrollment: null, rate: legacy.amount * 0.9, label: 'Tier 3' }
    ];
  }

  return baseStructure;
}

/**
 * Helper type for form state
 */
export interface FeeFormState {
  structure: Partial<FeeStructureV2>;
  validation: {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
  };
  isDirty: boolean;
  isSaving: boolean;
}
