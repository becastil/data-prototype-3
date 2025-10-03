/**
 * Advanced Fee Calculation Engine
 * Supports all rate types, tiering, modifiers, and constraints
 */

import {
  FeeStructureV2,
  FeeTier,
  MonthlyFeeInstance,
  BlendedRateComponent,
  FeeCalculationRequest,
  FeeCalculationResult,
  SeasonalModifier,
  RateConstraints
} from '@/types/fees';

/**
 * Main calculation function
 */
export function calculateMonthlyFee(
  feeStructure: FeeStructureV2,
  request: FeeCalculationRequest
): FeeCalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate inputs
    const validationResult = validateCalculationRequest(feeStructure, request);
    if (!validationResult.isValid) {
      return {
        success: false,
        errors: validationResult.errors
      };
    }

    // Step 1: Base calculation
    let baseCalculation = 0;
    let appliedTier: FeeTier | undefined;

    switch (feeStructure.rateBasis) {
      case 'pmpm':
        baseCalculation = calculatePMPM(feeStructure, request.enrollment);
        if (feeStructure.tieringEnabled && feeStructure.tiers) {
          const tierResult = applyTiering(feeStructure.tiers, request.enrollment);
          appliedTier = tierResult.tier;
          baseCalculation = tierResult.amount;
        }
        break;

      case 'pepm':
        baseCalculation = calculatePEPM(feeStructure, request.enrollment);
        if (feeStructure.tieringEnabled && feeStructure.tiers) {
          const tierResult = applyTiering(feeStructure.tiers, request.enrollment);
          appliedTier = tierResult.tier;
          baseCalculation = tierResult.amount;
        }
        break;

      case 'percent_premium':
        baseCalculation = calculatePercentageOfPremium(feeStructure, request.premiumAmount || 0);
        break;

      case 'percent_claims':
        baseCalculation = calculatePercentageOfClaims(feeStructure, request.claimsAmount || 0);
        break;

      case 'per_transaction':
        baseCalculation = calculatePerTransaction(feeStructure, request.transactionCount || 0);
        break;

      case 'flat':
        baseCalculation = feeStructure.baseAmount || 0;
        break;

      case 'blended':
        baseCalculation = calculateBlendedRate(feeStructure, request);
        break;

      case 'composite':
        baseCalculation = calculateCompositeRate(feeStructure, request);
        break;

      case 'manual':
        baseCalculation = feeStructure.baseAmount || 0;
        warnings.push('Manual fee type - amount not automatically calculated');
        break;

      default:
        errors.push(`Unsupported rate basis: ${feeStructure.rateBasis}`);
        return { success: false, errors };
    }

    // Step 2: Apply seasonal modifiers
    const seasonalAdjustment = applySeasonalModifiers(
      baseCalculation,
      feeStructure.seasonalModifiers,
      request.month
    );

    // Step 3: Apply escalation
    const escalationAdjustment = applyEscalation(
      baseCalculation,
      feeStructure.escalationSchedule,
      feeStructure.effectiveStartDate,
      request.month
    );

    // Step 4: Apply constraints (caps/floors)
    const constraintAdjustment = applyConstraints(
      baseCalculation + seasonalAdjustment + escalationAdjustment,
      feeStructure.constraints,
      request.enrollment
    );

    // Step 5: Apply pro-rating if needed
    const proRatedAmount = applyProRating(
      baseCalculation + seasonalAdjustment + escalationAdjustment + constraintAdjustment,
      feeStructure.proRating,
      request.month
    );

    // Calculate final amount
    const finalAmount = baseCalculation + seasonalAdjustment + escalationAdjustment + constraintAdjustment + proRatedAmount;

    // Build breakdown
    const breakdown = {
      baseCalculation,
      tierAdjustment: appliedTier ? appliedTier.rate - (feeStructure.baseAmount || 0) : undefined,
      seasonalAdjustment: seasonalAdjustment !== 0 ? seasonalAdjustment : undefined,
      escalationAdjustment: escalationAdjustment !== 0 ? escalationAdjustment : undefined,
      constraintAdjustment: constraintAdjustment !== 0 ? constraintAdjustment : undefined,
      proRatingAdjustment: proRatedAmount !== 0 ? proRatedAmount : undefined,
      components: feeStructure.rateBasis === 'blended'
        ? calculateBlendedComponents(feeStructure, request)
        : undefined
    };

    // Build monthly fee instance
    const monthlyFeeInstance: MonthlyFeeInstance = {
      id: `fee-instance-${Date.now()}`,
      feeStructureId: feeStructure.id,
      month: request.month,
      enrollment: request.enrollment,
      premiumAmount: request.premiumAmount,
      claimsAmount: request.claimsAmount,
      transactionCount: request.transactionCount,
      memberCount: request.memberCount,
      dependentCount: request.dependentCount,
      calculatedAmount: baseCalculation,
      appliedTier,
      appliedModifiers: [], // Populated with IDs of applied modifiers
      proRatedAmount: proRatedAmount !== 0 ? proRatedAmount : undefined,
      finalAmount,
      breakdown,
      calculatedAt: new Date().toISOString()
    };

    return {
      success: true,
      monthlyFeeInstance,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    errors.push(`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors };
  }
}

/**
 * Validate calculation request
 */
function validateCalculationRequest(
  feeStructure: FeeStructureV2,
  request: FeeCalculationRequest
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.month || !/^\d{4}-\d{2}$/.test(request.month)) {
    errors.push('Invalid month format (expected YYYY-MM)');
  }

  if (feeStructure.rateBasis === 'pmpm' || feeStructure.rateBasis === 'pepm') {
    if (request.enrollment <= 0) {
      errors.push('Enrollment must be greater than 0 for PMPM/PEPM calculations');
    }
  }

  if (feeStructure.rateBasis === 'percent_premium' && !request.premiumAmount) {
    errors.push('Premium amount required for percentage-based fee calculation');
  }

  if (feeStructure.rateBasis === 'percent_claims' && !request.claimsAmount) {
    errors.push('Claims amount required for percentage-based fee calculation');
  }

  if (feeStructure.rateBasis === 'per_transaction' && !request.transactionCount) {
    errors.push('Transaction count required for per-transaction fee calculation');
  }

  if (feeStructure.rateBasis === 'composite') {
    if (!request.memberCount || !request.dependentCount) {
      errors.push('Member and dependent counts required for composite rate calculation');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Calculate PMPM (Per Member Per Month)
 */
function calculatePMPM(feeStructure: FeeStructureV2, enrollment: number): number {
  return (feeStructure.baseAmount || 0) * enrollment;
}

/**
 * Calculate PEPM (Per Employee Per Month)
 */
function calculatePEPM(feeStructure: FeeStructureV2, enrollment: number): number {
  // Assuming enrollment represents employees for PEPM
  return (feeStructure.baseAmount || 0) * enrollment;
}

/**
 * Calculate percentage of premium
 */
function calculatePercentageOfPremium(feeStructure: FeeStructureV2, premiumAmount: number): number {
  const percentage = (feeStructure.percentage || 0) / 100;
  return premiumAmount * percentage;
}

/**
 * Calculate percentage of claims
 */
function calculatePercentageOfClaims(feeStructure: FeeStructureV2, claimsAmount: number): number {
  const percentage = (feeStructure.percentage || 0) / 100;
  return claimsAmount * percentage;
}

/**
 * Calculate per-transaction fee
 */
function calculatePerTransaction(feeStructure: FeeStructureV2, transactionCount: number): number {
  return (feeStructure.baseAmount || 0) * transactionCount;
}

/**
 * Calculate blended rate (combination of multiple components)
 */
function calculateBlendedRate(feeStructure: FeeStructureV2, request: FeeCalculationRequest): number {
  if (!feeStructure.blendedComponents || feeStructure.blendedComponents.length === 0) {
    return 0;
  }

  return feeStructure.blendedComponents.reduce((total, component) => {
    switch (component.type) {
      case 'fixed':
        return total + component.value;
      case 'percent_premium':
        return total + ((request.premiumAmount || 0) * (component.value / 100));
      case 'percent_claims':
        return total + ((request.claimsAmount || 0) * (component.value / 100));
      case 'pmpm':
        return total + (component.value * request.enrollment);
      default:
        return total;
    }
  }, 0);
}

/**
 * Calculate blended components breakdown
 */
function calculateBlendedComponents(
  feeStructure: FeeStructureV2,
  request: FeeCalculationRequest
): { label: string; amount: number }[] {
  if (!feeStructure.blendedComponents) return [];

  return feeStructure.blendedComponents.map(component => {
    let amount = 0;
    switch (component.type) {
      case 'fixed':
        amount = component.value;
        break;
      case 'percent_premium':
        amount = (request.premiumAmount || 0) * (component.value / 100);
        break;
      case 'percent_claims':
        amount = (request.claimsAmount || 0) * (component.value / 100);
        break;
      case 'pmpm':
        amount = component.value * request.enrollment;
        break;
    }

    return {
      label: component.label || component.type,
      amount
    };
  });
}

/**
 * Calculate composite rate (different rates for members vs dependents)
 */
function calculateCompositeRate(feeStructure: FeeStructureV2, request: FeeCalculationRequest): number {
  if (!feeStructure.compositeRate) return 0;

  const { memberRate, dependentRate, basis } = feeStructure.compositeRate;
  const memberCount = request.memberCount || 0;
  const dependentCount = request.dependentCount || 0;

  if (basis === 'pmpm') {
    return (memberRate * memberCount) + (dependentRate * dependentCount);
  } else {
    // For 'flat' basis, return fixed amounts
    return memberRate + dependentRate;
  }
}

/**
 * Apply tiering based on enrollment
 */
function applyTiering(tiers: FeeTier[], enrollment: number): { tier: FeeTier | undefined; amount: number } {
  const applicableTier = tiers.find(tier => {
    return enrollment >= tier.minEnrollment &&
      (tier.maxEnrollment === null || enrollment <= tier.maxEnrollment);
  });

  if (!applicableTier) {
    return { tier: undefined, amount: 0 };
  }

  const amount = applicableTier.rate * enrollment;
  return { tier: applicableTier, amount };
}

/**
 * Apply seasonal modifiers
 */
function applySeasonalModifiers(
  baseAmount: number,
  modifiers: SeasonalModifier[] | undefined,
  month: string
): number {
  if (!modifiers || modifiers.length === 0) return 0;

  const monthNumber = parseInt(month.split('-')[1], 10);
  const applicableModifier = modifiers.find(mod => mod.months.includes(monthNumber));

  if (!applicableModifier) return 0;

  return baseAmount * (applicableModifier.multiplier - 1); // Return adjustment amount
}

/**
 * Apply escalation schedule
 */
function applyEscalation(
  baseAmount: number,
  schedule: FeeStructureV2['escalationSchedule'],
  startDate: string,
  currentMonth: string
): number {
  if (!schedule) return 0;

  // Calculate months elapsed since start date
  const start = new Date(startDate);
  const current = new Date(`${currentMonth}-01`);
  const monthsElapsed = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth());

  if (monthsElapsed <= 0) return 0;

  // Calculate escalation periods
  let periods = 0;
  switch (schedule.frequency) {
    case 'monthly':
      periods = monthsElapsed;
      break;
    case 'quarterly':
      periods = Math.floor(monthsElapsed / 3);
      break;
    case 'annual':
      periods = Math.floor(monthsElapsed / 12);
      break;
  }

  if (periods === 0) return 0;

  // Apply escalation
  if (schedule.type === 'percentage') {
    const rate = schedule.value / 100;
    if (schedule.compounding) {
      const multiplier = Math.pow(1 + rate, periods);
      return baseAmount * (multiplier - 1); // Return adjustment amount
    } else {
      return baseAmount * (rate * periods); // Simple escalation
    }
  } else {
    // Fixed amount escalation
    return schedule.value * periods;
  }
}

/**
 * Apply constraints (caps and floors)
 */
function applyConstraints(
  calculatedAmount: number,
  constraints: RateConstraints | undefined,
  enrollment: number
): number {
  if (!constraints) return 0;

  let adjustment = 0;

  // Apply floor
  if (constraints.minAmount && calculatedAmount < constraints.minAmount) {
    adjustment = constraints.minAmount - calculatedAmount;
  }

  // Apply cap
  if (constraints.maxAmount && calculatedAmount > constraints.maxAmount) {
    adjustment = constraints.maxAmount - calculatedAmount;
  }

  // Apply per-member floor
  if (constraints.minPerMember) {
    const minTotal = constraints.minPerMember * enrollment;
    if (calculatedAmount < minTotal) {
      adjustment = Math.max(adjustment, minTotal - calculatedAmount);
    }
  }

  // Apply per-member cap
  if (constraints.maxPerMember) {
    const maxTotal = constraints.maxPerMember * enrollment;
    if (calculatedAmount > maxTotal) {
      adjustment = Math.min(adjustment, maxTotal - calculatedAmount);
    }
  }

  return adjustment;
}

/**
 * Apply pro-rating for partial months
 */
function applyProRating(
  amount: number,
  proRating: FeeStructureV2['proRating'],
  month: string
): number {
  if (!proRating || !proRating.enabled) return 0;

  // For simplicity, assuming full month
  // In production, you'd check actual enrollment dates and calculate partial days
  return 0;
}

/**
 * Batch calculate fees for multiple months
 */
export function calculateMultipleMonths(
  feeStructure: FeeStructureV2,
  requests: FeeCalculationRequest[]
): FeeCalculationResult[] {
  return requests.map(request => calculateMonthlyFee(feeStructure, request));
}

/**
 * Project annual fees based on current configuration
 */
export function projectAnnualFees(
  feeStructure: FeeStructureV2,
  avgEnrollment: number,
  avgPremium?: number,
  avgClaims?: number
): { totalProjected: number; byMonth: { month: string; amount: number }[] } {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return date.toISOString().substring(0, 7);
  });

  const results = months.map(month => {
    const request: FeeCalculationRequest = {
      feeStructureId: feeStructure.id,
      month,
      enrollment: avgEnrollment,
      premiumAmount: avgPremium,
      claimsAmount: avgClaims
    };

    const result = calculateMonthlyFee(feeStructure, request);
    return {
      month,
      amount: result.monthlyFeeInstance?.finalAmount || 0
    };
  });

  const totalProjected = results.reduce((sum, r) => sum + r.amount, 0);

  return { totalProjected, byMonth: results };
}
