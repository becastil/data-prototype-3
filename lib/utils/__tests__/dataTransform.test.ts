import {
  generateMonthlySummaries,
  generateDashboardKPIs,
  generateCategoryBreakdown,
  generateMonthlyTrendData,
  generateDiagnosisBreakdown,
  generatePremiumData,
  exportToCSV,
  formatCurrency,
  formatPercentage,
  formatNumber,
} from '../dataTransform';
import { ExperienceData, HighCostClaimant, FeeStructure, MonthlySummary } from '@/types/healthcare';

// Mock data helpers
function createMockExperienceData(month: string, baseAmount: number = 10000): ExperienceData {
  return {
    id: `exp-${month}`,
    month,
    domesticMedicalIP: baseAmount,
    domesticMedicalOP: baseAmount * 0.8,
    nonDomesticMedical: baseAmount * 0.15,
    prescriptionDrugs: baseAmount * 0.45,
    dental: baseAmount * 0.12,
    vision: baseAmount * 0.035,
    mentalHealth: baseAmount * 0.18,
    preventiveCare: baseAmount * 0.085,
    emergencyRoom: baseAmount * 0.25,
    urgentCare: baseAmount * 0.12,
    specialtyCare: baseAmount * 0.35,
    labDiagnostic: baseAmount * 0.15,
    physicalTherapy: baseAmount * 0.08,
    dme: baseAmount * 0.05,
    homeHealth: baseAmount * 0.075,
    enrollment: 1200,
  };
}

function createMockFeeStructure(month: string, amount: number = 15000): FeeStructure {
  return {
    id: `fee-${month}`,
    month,
    feeType: 'pmpm',
    amount: 12.5,
    enrollment: 1200,
    calculatedTotal: amount,
    effectiveDate: month,
  };
}

function createMockHighCostClaimant(id: string, diagnosisCode: string): HighCostClaimant {
  return {
    id: `hcc-${id}`,
    memberId: id,
    age: 45,
    gender: 'M',
    primaryDiagnosisCode: diagnosisCode,
    primaryDiagnosisDescription: `Diagnosis for ${diagnosisCode}`,
    totalPaidAmount: 125000,
    claimCount: 24,
    enrollmentMonths: 12,
    riskScore: 2.8,
  };
}

describe('Data Transformation', () => {
  describe('generateMonthlySummaries', () => {
    const experienceData = [
      createMockExperienceData('2024-01', 10000),
      createMockExperienceData('2024-02', 11000),
      createMockExperienceData('2024-03', 10500),
    ];

    const feeStructures = [
      createMockFeeStructure('2024-01', 15000),
      createMockFeeStructure('2024-02', 16000),
      createMockFeeStructure('2024-03', 15500),
    ];

    const premiumData = [
      { month: '2024-01', premiumAmount: 120000, enrollment: 1200 },
      { month: '2024-02', premiumAmount: 125000, enrollment: 1200 },
      { month: '2024-03', premiumAmount: 122000, enrollment: 1200 },
    ];

    it('should generate summaries for all months', () => {
      const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData);

      expect(summaries).toHaveLength(3);
      expect(summaries[0].month).toBe('2024-01');
      expect(summaries[1].month).toBe('2024-02');
      expect(summaries[2].month).toBe('2024-03');
    });

    it('should calculate total claims correctly', () => {
      const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData);

      // Total claims should sum all claim categories
      expect(summaries[0].claims).toBeGreaterThan(0);
      expect(summaries[0].totalCost).toBe(summaries[0].claims + summaries[0].fees);
    });

    it('should calculate monthly loss ratios', () => {
      const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData);

      summaries.forEach(summary => {
        expect(summary.monthlyLossRatio).toBeGreaterThan(0);
        expect(summary.monthlyLossRatio).toBe((summary.claims + summary.fees) / summary.premiums);
      });
    });

    it('should calculate rolling 12-month loss ratios', () => {
      const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData);

      summaries.forEach(summary => {
        expect(summary.rolling12LossRatio).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate variance from target', () => {
      const targetLossRatio = 0.85;
      const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData, targetLossRatio);

      summaries.forEach(summary => {
        expect(summary.variance).toBeDefined();
        expect(typeof summary.variance).toBe('number');
      });
    });

    it('should calculate PMPM', () => {
      const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData);

      summaries.forEach(summary => {
        expect(summary.pmpm).toBeGreaterThan(0);
        expect(summary.pmpm).toBe(summary.claims / summary.memberMonths);
      });
    });

    it('should handle missing fee data', () => {
      const summaries = generateMonthlySummaries(experienceData, [], premiumData);

      summaries.forEach(summary => {
        expect(summary.fees).toBe(0);
      });
    });

    it('should handle missing premium data', () => {
      const summaries = generateMonthlySummaries(experienceData, feeStructures, []);

      summaries.forEach(summary => {
        expect(summary.premiums).toBe(0);
        expect(summary.monthlyLossRatio).toBe(0);
      });
    });

    it('should sort data by month for proper calculations', () => {
      const unsortedExperience = [
        createMockExperienceData('2024-03', 10500),
        createMockExperienceData('2024-01', 10000),
        createMockExperienceData('2024-02', 11000),
      ];

      const summaries = generateMonthlySummaries(unsortedExperience, feeStructures, premiumData);

      expect(summaries[0].month).toBe('2024-01');
      expect(summaries[1].month).toBe('2024-02');
      expect(summaries[2].month).toBe('2024-03');
    });
  });

  describe('generateDashboardKPIs', () => {
    const mockSummaries: MonthlySummary[] = [
      {
        id: 'sum-1',
        month: '2024-01',
        claims: 100000,
        fees: 15000,
        premiums: 120000,
        totalCost: 115000,
        monthlyLossRatio: 0.958,
        rolling12LossRatio: 0.95,
        variance: 12.7,
        memberMonths: 1200,
        pmpm: 83.33,
      },
      {
        id: 'sum-2',
        month: '2024-02',
        claims: 110000,
        fees: 16000,
        premiums: 125000,
        totalCost: 126000,
        monthlyLossRatio: 1.008,
        rolling12LossRatio: 0.96,
        variance: 18.6,
        memberMonths: 1195,
        pmpm: 92.05,
      },
    ];

    it('should calculate total claims', () => {
      const kpis = generateDashboardKPIs(mockSummaries);

      expect(kpis.totalClaims).toBe(210000);
    });

    it('should calculate total cost', () => {
      const kpis = generateDashboardKPIs(mockSummaries);

      expect(kpis.totalCost).toBe(241000);
    });

    it('should calculate weighted average loss ratio', () => {
      const kpis = generateDashboardKPIs(mockSummaries);

      expect(kpis.avgLossRatio).toBeGreaterThan(0);
      expect(kpis.avgLossRatio).toBeLessThan(2);
    });

    it('should calculate average claim per member month', () => {
      const kpis = generateDashboardKPIs(mockSummaries);

      expect(kpis.avgClaim).toBeCloseTo(210000 / 2395, 2);
    });

    it('should calculate average PMPM', () => {
      const kpis = generateDashboardKPIs(mockSummaries);

      expect(kpis.avgPMPM).toBeCloseTo((83.33 + 92.05) / 2, 1);
    });

    it('should estimate total members', () => {
      const kpis = generateDashboardKPIs(mockSummaries);

      expect(kpis.totalMembers).toBeGreaterThan(0);
      expect(Number.isInteger(kpis.totalMembers)).toBe(true);
    });

    it('should handle empty summaries', () => {
      const kpis = generateDashboardKPIs([]);

      expect(kpis.totalClaims).toBe(0);
      expect(kpis.totalCost).toBe(0);
      expect(kpis.avgLossRatio).toBe(0);
      expect(kpis.avgClaim).toBe(0);
      expect(kpis.totalMembers).toBe(0);
      expect(kpis.avgPMPM).toBe(0);
    });
  });

  describe('generateCategoryBreakdown', () => {
    const experienceData = [
      createMockExperienceData('2024-01', 10000),
      createMockExperienceData('2024-02', 11000),
    ];

    it('should generate breakdown for all categories', () => {
      const breakdown = generateCategoryBreakdown(experienceData);

      expect(breakdown.length).toBeGreaterThan(0);
      expect(breakdown.every(cat => cat.amount > 0)).toBe(true);
    });

    it('should sort categories by amount descending', () => {
      const breakdown = generateCategoryBreakdown(experienceData);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i - 1].amount).toBeGreaterThanOrEqual(breakdown[i].amount);
      }
    });

    it('should calculate percentages correctly', () => {
      const breakdown = generateCategoryBreakdown(experienceData);

      const totalPercentage = breakdown.reduce((sum, cat) => sum + cat.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 0);
    });

    it('should assign colors to categories', () => {
      const breakdown = generateCategoryBreakdown(experienceData);

      breakdown.forEach(cat => {
        expect(cat.color).toBeDefined();
        expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should filter out zero-amount categories', () => {
      const zeroData: ExperienceData[] = [{
        ...createMockExperienceData('2024-01', 0),
        domesticMedicalIP: 10000, // Only one category with value
      }];

      const breakdown = generateCategoryBreakdown(zeroData);

      expect(breakdown.length).toBeLessThan(15); // Not all categories included
      expect(breakdown.every(cat => cat.amount > 0)).toBe(true);
    });

    it('should handle empty data', () => {
      const breakdown = generateCategoryBreakdown([]);

      expect(breakdown).toHaveLength(0);
    });

    it('should aggregate across multiple months', () => {
      const breakdown = generateCategoryBreakdown(experienceData);

      // With 2 months, totals should be roughly 2x single month
      expect(breakdown[0].amount).toBeGreaterThan(10000);
    });
  });

  describe('generateMonthlyTrendData', () => {
    const experienceData = [
      createMockExperienceData('2024-01', 10000),
      createMockExperienceData('2024-02', 11000),
    ];

    const feeStructures = [
      createMockFeeStructure('2024-01', 15000),
      createMockFeeStructure('2024-02', 16000),
    ];

    const premiumData = [
      { month: '2024-01', premiumAmount: 120000, enrollment: 1200 },
      { month: '2024-02', premiumAmount: 125000, enrollment: 1200 },
    ];

    const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData);

    it('should generate trend data for all months', () => {
      const trendData = generateMonthlyTrendData(experienceData, feeStructures, summaries);

      expect(trendData).toHaveLength(2);
      expect(trendData[0].month).toBe('2024-01');
      expect(trendData[1].month).toBe('2024-02');
    });

    it('should include claims, fees, and loss ratio', () => {
      const trendData = generateMonthlyTrendData(experienceData, feeStructures, summaries);

      trendData.forEach(trend => {
        expect(trend.claims).toBeGreaterThanOrEqual(0);
        expect(trend.fees).toBeGreaterThanOrEqual(0);
        expect(trend.lossRatio).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include enrollment and PMPM', () => {
      const trendData = generateMonthlyTrendData(experienceData, feeStructures, summaries);

      trendData.forEach(trend => {
        expect(trend.enrollment).toBeGreaterThan(0);
        expect(trend.pmpm).toBeGreaterThan(0);
      });
    });

    it('should sort data chronologically', () => {
      const unsortedExperience = [
        createMockExperienceData('2024-02', 11000),
        createMockExperienceData('2024-01', 10000),
      ];

      const trendData = generateMonthlyTrendData(unsortedExperience, feeStructures, summaries);

      expect(trendData[0].month).toBe('2024-01');
      expect(trendData[1].month).toBe('2024-02');
    });
  });

  describe('generateDiagnosisBreakdown', () => {
    const highCostClaimants = [
      createMockHighCostClaimant('M001', 'E11.9'),
      createMockHighCostClaimant('M002', 'I25.10'),
      createMockHighCostClaimant('M003', 'E11.9'), // Same diagnosis as M001
    ];

    it('should aggregate claimants by diagnosis code', () => {
      const breakdown = generateDiagnosisBreakdown(highCostClaimants);

      expect(breakdown.length).toBeLessThan(highCostClaimants.length);
      expect(breakdown.some(d => d.memberCount > 1)).toBe(true);
    });

    it('should calculate total cost per diagnosis', () => {
      const breakdown = generateDiagnosisBreakdown(highCostClaimants);

      breakdown.forEach(diagnosis => {
        expect(diagnosis.totalCost).toBeGreaterThan(0);
      });
    });

    it('should count claims and members', () => {
      const breakdown = generateDiagnosisBreakdown(highCostClaimants);

      const e119Diagnosis = breakdown.find(d => d.diagnosisCode === 'E11.9');
      expect(e119Diagnosis).toBeDefined();
      expect(e119Diagnosis?.memberCount).toBe(2);
      expect(e119Diagnosis?.claimCount).toBe(48); // 24 * 2
    });

    it('should calculate average cost per claim', () => {
      const breakdown = generateDiagnosisBreakdown(highCostClaimants);

      breakdown.forEach(diagnosis => {
        expect(diagnosis.avgCostPerClaim).toBe(diagnosis.totalCost / diagnosis.claimCount);
      });
    });

    it('should sort by total cost descending', () => {
      const breakdown = generateDiagnosisBreakdown(highCostClaimants);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i - 1].totalCost).toBeGreaterThanOrEqual(breakdown[i].totalCost);
      }
    });

    it('should handle empty claimant list', () => {
      const breakdown = generateDiagnosisBreakdown([]);

      expect(breakdown).toHaveLength(0);
    });
  });

  describe('generatePremiumData', () => {
    const experienceData = [
      createMockExperienceData('2024-01', 10000),
      createMockExperienceData('2024-02', 11000),
    ];

    const feeStructures = [
      createMockFeeStructure('2024-01', 15000),
      createMockFeeStructure('2024-02', 16000),
    ];

    it('should generate premium data for all months', () => {
      const premiumData = generatePremiumData(experienceData, feeStructures);

      expect(premiumData).toHaveLength(2);
      expect(premiumData[0].month).toBe('2024-01');
      expect(premiumData[1].month).toBe('2024-02');
    });

    it('should calculate premiums based on target loss ratio', () => {
      const premiumData = generatePremiumData(experienceData, feeStructures);

      premiumData.forEach(premium => {
        expect(premium.premiumAmount).toBeGreaterThan(0);
      });
    });

    it('should include enrollment data', () => {
      const premiumData = generatePremiumData(experienceData, feeStructures);

      premiumData.forEach(premium => {
        expect(premium.enrollment).toBe(1200);
      });
    });

    it('should respect minimum premium rate', () => {
      const premiumRate = 500;
      const premiumData = generatePremiumData(experienceData, feeStructures, premiumRate);

      premiumData.forEach((premium, index) => {
        const minPremium = premiumRate * experienceData[index].enrollment;
        expect(premium.premiumAmount).toBeGreaterThanOrEqual(minPremium);
      });
    });
  });

  describe('exportToCSV', () => {
    const testData = [
      { id: '1', name: 'Item 1', value: 100 },
      { id: '2', name: 'Item 2', value: 200 },
    ];

    it('should export data to CSV format', () => {
      const csv = exportToCSV(testData, 'test.csv');

      expect(csv).toContain('id,name,value');
      expect(csv.split('\n')).toHaveLength(3); // Header + 2 data rows
    });

    it('should use custom column definitions', () => {
      const columns = [
        { key: 'id' as const, header: 'ID' },
        { key: 'name' as const, header: 'Name' },
      ];

      const csv = exportToCSV(testData, 'test.csv', columns);

      expect(csv).toContain('ID,Name');
      expect(csv).not.toContain('value');
    });

    it('should handle values with commas', () => {
      const dataWithCommas = [
        { id: '1', name: 'Smith, John', value: 100 },
      ];

      const csv = exportToCSV(dataWithCommas, 'test.csv');

      expect(csv).toContain('"Smith, John"');
    });

    it('should handle empty data', () => {
      const csv = exportToCSV([], 'test.csv');

      expect(csv).toBe('');
    });
  });

  describe('Formatting Functions', () => {
    describe('formatCurrency', () => {
      it('should format currency with USD by default', () => {
        const formatted = formatCurrency(12345.67);

        expect(formatted).toContain('$');
        expect(formatted).toContain('12,345');
      });

      it('should format without decimal places', () => {
        const formatted = formatCurrency(12345.67);

        expect(formatted).not.toContain('.67');
      });

      it('should handle zero', () => {
        const formatted = formatCurrency(0);

        expect(formatted).toContain('$0');
      });

      it('should handle negative numbers', () => {
        const formatted = formatCurrency(-1234);

        expect(formatted).toContain('-');
        expect(formatted).toContain('1,234');
      });

      it('should support different currencies', () => {
        const formatted = formatCurrency(1000, 'EUR');

        expect(formatted).toBeDefined();
      });
    });

    describe('formatPercentage', () => {
      it('should format as percentage with default 1 decimal', () => {
        const formatted = formatPercentage(0.1234);

        expect(formatted).toBe('12.3%');
      });

      it('should support custom decimal places', () => {
        const formatted = formatPercentage(0.1234, 2);

        expect(formatted).toBe('12.34%');
      });

      it('should handle zero', () => {
        const formatted = formatPercentage(0);

        expect(formatted).toBe('0.0%');
      });

      it('should handle values over 100%', () => {
        const formatted = formatPercentage(1.5);

        expect(formatted).toBe('150.0%');
      });
    });

    describe('formatNumber', () => {
      it('should format with thousand separators', () => {
        const formatted = formatNumber(1234567);

        expect(formatted).toBe('1,234,567');
      });

      it('should support decimal places', () => {
        const formatted = formatNumber(1234.5678, 2);

        expect(formatted).toBe('1,234.57');
      });

      it('should default to zero decimals', () => {
        const formatted = formatNumber(1234.56);

        expect(formatted).toBe('1,235'); // Rounded
      });

      it('should handle zero', () => {
        const formatted = formatNumber(0);

        expect(formatted).toBe('0');
      });
    });
  });
});