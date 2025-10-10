import {
  calculateMonthlyStats,
  calculatePEPM,
  calculateTotalPlanCost,
  calculateNetMedicalPharmacyClaims,
} from '../template-formulas';
import type { MonthlyPlanStats, PEPMCalculation } from '@/types/enterprise-template';

describe('template-formulas', () => {
  describe('calculateNetMedicalPharmacyClaims', () => {
    it('should calculate net claims correctly', () => {
      const result = calculateNetMedicalPharmacyClaims(100000, 25000, 5000, 3000);
      expect(result).toBe(117000); // 100000 + 25000 - 5000 - 3000
    });

    it('should handle zero values', () => {
      const result = calculateNetMedicalPharmacyClaims(0, 0, 0, 0);
      expect(result).toBe(0);
    });

    it('should handle negative adjustments correctly', () => {
      const result = calculateNetMedicalPharmacyClaims(50000, 10000, 0, 2000);
      expect(result).toBe(58000); // 50000 + 10000 - 0 - 2000
    });
  });

  describe('calculateTotalPlanCost', () => {
    it('should calculate total plan cost with all components', () => {
      const result = calculateTotalPlanCost(
        100000, // netMedicalPharmacy
        10000,  // adminFees
        5000,   // stopLossFees
        3000    // specStopLossReimb
      );
      expect(result).toBe(112000); // 100000 + 10000 + 5000 - 3000
    });

    it('should handle zero stop loss reimbursement', () => {
      const result = calculateTotalPlanCost(100000, 10000, 5000, 0);
      expect(result).toBe(115000);
    });

    it('should handle large stop loss reimbursement', () => {
      const result = calculateTotalPlanCost(100000, 10000, 5000, 50000);
      expect(result).toBe(65000); // Net can be negative in edge cases
    });
  });

  describe('calculateMonthlyStats', () => {
    it('should calculate complete monthly stats from raw data', () => {
      const rawData: Partial<MonthlyPlanStats> = {
        id: '1',
        monthSnapshotId: '2024-07',
        planId: 'ALL_PLANS',
        totalSubscribers: 450,
        medicalClaims: 250000,
        pharmacyClaims: 50000,
        specStopLossReimb: 10000,
        estimatedRxRebates: 5000,
        adminFees: 15000,
        stopLossFees: 20000,
        budgetedPremium: 350000,
      };

      const result = calculateMonthlyStats(rawData);

      // Check all calculated fields exist
      expect(result.netMedicalPharmacyClaims).toBeDefined();
      expect(result.totalPlanCost).toBeDefined();
      expect(result.surplusDeficit).toBeDefined();
      expect(result.pepm).toBeDefined();
      expect(result.percentOfBudget).toBeDefined();

      // Verify calculations
      const expectedNetClaims = 250000 + 50000 - 10000 - 5000; // 285000
      expect(result.netMedicalPharmacyClaims).toBe(expectedNetClaims);

      const expectedTotalCost = expectedNetClaims + 15000 + 20000; // 320000
      expect(result.totalPlanCost).toBe(expectedTotalCost);

      expect(result.surplusDeficit).toBe(350000 - 320000); // 30000
      expect(result.pepm).toBeCloseTo(320000 / 450, 2); // ~711.11
      expect(result.percentOfBudget).toBeCloseTo((320000 / 350000) * 100, 2); // ~91.43%
    });

    it('should handle zero enrollment gracefully', () => {
      const rawData: Partial<MonthlyPlanStats> = {
        id: '1',
        monthSnapshotId: '2024-07',
        planId: 'ALL_PLANS',
        totalSubscribers: 0,
        medicalClaims: 100000,
        pharmacyClaims: 20000,
        specStopLossReimb: 0,
        estimatedRxRebates: 0,
        adminFees: 5000,
        stopLossFees: 3000,
        budgetedPremium: 150000,
      };

      const result = calculateMonthlyStats(rawData);

      // PEPM should be 0 or Infinity depending on implementation
      expect(result.pepm).toBe(0);
      expect(result.totalPlanCost).toBe(128000); // 100000 + 20000 + 5000 + 3000
    });
  });

  describe('calculatePEPM', () => {
    const mockData: MonthlyPlanStats[] = [
      {
        id: '1',
        monthSnapshotId: '2024-07',
        planId: 'ALL_PLANS',
        totalSubscribers: 450,
        medicalClaims: 200000,
        pharmacyClaims: 40000,
        specStopLossReimb: 0,
        estimatedRxRebates: 5000,
        adminFees: 10000,
        stopLossFees: 15000,
        budgetedPremium: 300000,
        netMedicalPharmacyClaims: 235000,
        totalPlanCost: 260000,
        surplusDeficit: 40000,
        pepm: 577.78,
        percentOfBudget: 86.67,
      },
      {
        id: '2',
        monthSnapshotId: '2024-08',
        planId: 'ALL_PLANS',
        totalSubscribers: 460,
        medicalClaims: 220000,
        pharmacyClaims: 45000,
        specStopLossReimb: 10000,
        estimatedRxRebates: 6000,
        adminFees: 11000,
        stopLossFees: 16000,
        budgetedPremium: 320000,
        netMedicalPharmacyClaims: 249000,
        totalPlanCost: 276000,
        surplusDeficit: 44000,
        pepm: 600.00,
        percentOfBudget: 86.25,
      },
    ];

    it('should calculate PEPM metrics for multiple months', () => {
      const result: PEPMCalculation = calculatePEPM(mockData, 'Test Period');

      expect(result.periodLabel).toBe('Test Period');
      expect(result.totalMonths).toBe(2);

      // Verify totals
      expect(result.totalMedicalClaims).toBe(420000); // 200000 + 220000
      expect(result.totalPharmacyClaims).toBe(85000); // 40000 + 45000
      expect(result.totalAdminFees).toBe(21000); // 10000 + 11000
      expect(result.totalStopLossFees).toBe(31000); // 15000 + 16000

      // Verify averages
      expect(result.avgSubscribers).toBe(455); // (450 + 460) / 2
      expect(result.pepmMedical).toBeCloseTo(420000 / 910, 2); // Total subscribers = 450 + 460
      expect(result.pepmPharmacy).toBeCloseTo(85000 / 910, 2);
    });

    it('should handle single month data', () => {
      const result = calculatePEPM([mockData[0]], 'Single Month');

      expect(result.totalMonths).toBe(1);
      expect(result.avgSubscribers).toBe(450);
      expect(result.totalMedicalClaims).toBe(200000);
    });

    it('should handle empty array gracefully', () => {
      const result = calculatePEPM([], 'Empty Period');

      expect(result.totalMonths).toBe(0);
      expect(result.avgSubscribers).toBe(0);
      expect(result.totalMedicalClaims).toBe(0);
      expect(result.pepmMedical).toBe(0);
    });
  });
});
