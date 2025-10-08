import { useState, useCallback, useEffect, useMemo } from 'react';
import { FeeStructureV2, MonthlyFeeInstance, FeeCalculationRequest } from '@/types/fees';
import { ExperienceData } from '@/types/healthcare';
import { calculateMonthlyFee } from '@/lib/calculations/fee-calculator';

interface UseFeeCalculationsOptions {
  feeStructures: FeeStructureV2[];
  experienceData: ExperienceData[];
  autoRecalculate?: boolean;
}

interface MonthlyFeeData {
  month: string;
  feeInstances: MonthlyFeeInstance[];
  totalFees: number;
  enrollment: number;
  errors: string[];
  warnings: string[];
}

export function useFeeCalculations({
  feeStructures,
  experienceData,
  autoRecalculate = true
}: UseFeeCalculationsOptions) {
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFeeData[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationErrors, setCalculationErrors] = useState<string[]>([]);
  const [needsRecalculation, setNeedsRecalculation] = useState(false);

  // Track data changes to trigger recalculation
  const dataHash = useMemo(() => {
    return JSON.stringify({
      feeCount: feeStructures.length,
      experienceCount: experienceData.length,
      feeIds: feeStructures.map(f => f.id).sort().join(','),
      months: experienceData.map(e => e.month).sort().join(',')
    });
  }, [feeStructures, experienceData]);

  /**
   * Calculate fees for all months
   */
  const calculateAll = useCallback(() => {
    if (experienceData.length === 0 || feeStructures.length === 0) {
      setMonthlyFees([]);
      setCalculationErrors(['No experience data or fee structures available']);
      return;
    }

    setIsCalculating(true);
    setCalculationErrors([]);

    try {
      const results: MonthlyFeeData[] = [];

      // Process each month in experience data
      for (const monthData of experienceData) {
        const monthErrors: string[] = [];
        const monthWarnings: string[] = [];
        const feeInstances: MonthlyFeeInstance[] = [];

        // Calculate each fee structure for this month
        for (const feeStructure of feeStructures) {
          // Check if fee structure is active for this month
          const monthDate = new Date(`${monthData.month}-01`);
          const startDate = new Date(feeStructure.effectiveStartDate);
          const endDate = feeStructure.effectiveEndDate
            ? new Date(feeStructure.effectiveEndDate)
            : null;

          // Skip if outside effective date range
          if (monthDate < startDate || (endDate && monthDate > endDate)) {
            continue;
          }

          // Prepare calculation request
          const request: FeeCalculationRequest = {
            feeStructureId: feeStructure.id,
            month: monthData.month,
            enrollment: monthData.enrollment,
            // These would come from uploaded data or other sources
            premiumAmount: undefined, // Would be populated from premium data
            claimsAmount: undefined,   // Would be populated from claims data
            transactionCount: undefined,
            memberCount: undefined,
            dependentCount: undefined
          };

          // Calculate fee
          const result = calculateMonthlyFee(feeStructure, request);

          if (result.success && result.monthlyFeeInstance) {
            feeInstances.push(result.monthlyFeeInstance);
            if (result.warnings) {
              monthWarnings.push(...result.warnings);
            }
          } else if (result.errors) {
            monthErrors.push(...result.errors);
          }
        }

        // Calculate total fees for the month
        const totalFees = feeInstances.reduce(
          (sum, instance) => sum + instance.finalAmount,
          0
        );

        results.push({
          month: monthData.month,
          feeInstances,
          totalFees,
          enrollment: monthData.enrollment,
          errors: monthErrors,
          warnings: monthWarnings
        });
      }

      setMonthlyFees(results);
      setNeedsRecalculation(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
      setCalculationErrors([errorMessage]);
    } finally {
      setIsCalculating(false);
    }
  }, [experienceData, feeStructures]);

  /**
   * Calculate fees for a specific month
   */
  const calculateMonth = useCallback((month: string) => {
    const monthData = experienceData.find(data => data.month === month);
    if (!monthData) {
      return null;
    }

    const feeInstances: MonthlyFeeInstance[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const feeStructure of feeStructures) {
      const request: FeeCalculationRequest = {
        feeStructureId: feeStructure.id,
        month: monthData.month,
        enrollment: monthData.enrollment,
        premiumAmount: undefined,
        claimsAmount: undefined,
        transactionCount: undefined,
        memberCount: undefined,
        dependentCount: undefined
      };

      const result = calculateMonthlyFee(feeStructure, request);

      if (result.success && result.monthlyFeeInstance) {
        feeInstances.push(result.monthlyFeeInstance);
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      } else if (result.errors) {
        errors.push(...result.errors);
      }
    }

    const totalFees = feeInstances.reduce((sum, instance) => sum + instance.finalAmount, 0);

    return {
      month: monthData.month,
      feeInstances,
      totalFees,
      enrollment: monthData.enrollment,
      errors,
      warnings
    };
  }, [experienceData, feeStructures]);

  /**
   * Get fee breakdown for a specific month
   */
  const getFeeBreakdown = useCallback((month: string) => {
    const monthFees = monthlyFees.find(mf => mf.month === month);
    if (!monthFees) {
      return null;
    }

    return {
      month: monthFees.month,
      fees: monthFees.feeInstances.map(instance => ({
        id: instance.feeStructureId,
        name: feeStructures.find(f => f.id === instance.feeStructureId)?.name || 'Unknown',
        amount: instance.finalAmount,
        breakdown: instance.breakdown,
        appliedTier: instance.appliedTier
      })),
      totalFees: monthFees.totalFees,
      enrollment: monthFees.enrollment
    };
  }, [monthlyFees, feeStructures]);

  /**
   * Get summary statistics
   */
  const summary = useMemo(() => {
    if (monthlyFees.length === 0) {
      return {
        totalFees: 0,
        avgMonthlyFee: 0,
        avgEnrollment: 0,
        monthCount: 0,
        totalErrors: 0,
        totalWarnings: 0
      };
    }

    const totalFees = monthlyFees.reduce((sum, mf) => sum + mf.totalFees, 0);
    const totalEnrollment = monthlyFees.reduce((sum, mf) => sum + mf.enrollment, 0);
    const totalErrors = monthlyFees.reduce((sum, mf) => sum + mf.errors.length, 0);
    const totalWarnings = monthlyFees.reduce((sum, mf) => sum + mf.warnings.length, 0);

    return {
      totalFees,
      avgMonthlyFee: totalFees / monthlyFees.length,
      avgEnrollment: totalEnrollment / monthlyFees.length,
      monthCount: monthlyFees.length,
      totalErrors,
      totalWarnings
    };
  }, [monthlyFees]);

  /**
   * Force recalculation
   */
  const recalculate = useCallback(() => {
    calculateAll();
  }, [calculateAll]);

  // Auto-recalculate when data changes
  useEffect(() => {
    if (autoRecalculate) {
      calculateAll();
    } else {
      setNeedsRecalculation(true);
    }
  }, [dataHash, autoRecalculate, calculateAll]);

  return {
    // Data
    monthlyFees,
    summary,
    calculationErrors,

    // State
    isCalculating,
    needsRecalculation,

    // Methods
    calculateAll,
    calculateMonth,
    getFeeBreakdown,
    recalculate
  };
}
