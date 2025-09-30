import {
  calculatePMPM,
  calculatePEPM,
  calculateMemberMonths,
  calculatePMPMWithTrend,
  calculatePMPMByCategory,
  calculateMonthlyPMPMTrends,
  calculateRollingAveragePMPM,
  calculatePMPMBenchmarks,
  calculatePMPMVarianceAnalysis,
  projectPMPM,
  analyzePMPMCostDrivers,
  PMPMInput,
} from '../pmpm';

describe('PMPM Calculations', () => {
  describe('calculatePMPM', () => {
    it('should calculate basic PMPM correctly', () => {
      const result = calculatePMPM(120000, 1000);
      expect(result).toBe(120);
    });

    it('should handle zero total cost', () => {
      const result = calculatePMPM(0, 1000);
      expect(result).toBe(0);
    });

    it('should throw error for zero member months', () => {
      expect(() => calculatePMPM(120000, 0)).toThrow(
        'Member months cannot be zero for PMPM calculation'
      );
    });

    it('should handle decimal values', () => {
      const result = calculatePMPM(125000.50, 1234.5);
      expect(result).toBeCloseTo(101.25, 2);
    });

    it('should calculate high PMPM', () => {
      const result = calculatePMPM(500000, 1000);
      expect(result).toBe(500);
    });
  });

  describe('calculatePEPM', () => {
    it('should calculate basic PEPM correctly', () => {
      const result = calculatePEPM(120000, 500);
      expect(result).toBe(240);
    });

    it('should handle zero total cost', () => {
      const result = calculatePEPM(0, 500);
      expect(result).toBe(0);
    });

    it('should throw error for zero employees', () => {
      expect(() => calculatePEPM(120000, 0)).toThrow(
        'Employees cannot be zero for PEPM calculation'
      );
    });

    it('should handle decimal employees', () => {
      const result = calculatePEPM(100000, 333.33);
      expect(result).toBeCloseTo(300.00, 1);
    });
  });

  describe('calculateMemberMonths', () => {
    it('should calculate member months correctly', () => {
      const result = calculateMemberMonths(1000, 12);
      expect(result).toBe(12000);
    });

    it('should handle zero enrollment', () => {
      const result = calculateMemberMonths(0, 12);
      expect(result).toBe(0);
    });

    it('should handle partial months', () => {
      const result = calculateMemberMonths(500, 6);
      expect(result).toBe(3000);
    });

    it('should handle decimal enrollment', () => {
      const result = calculateMemberMonths(1234.5, 12);
      expect(result).toBe(14814);
    });
  });

  describe('calculatePMPMWithTrend', () => {
    it('should detect increasing trend', () => {
      const currentData: PMPMInput = { totalCost: 130000, memberMonths: 1000 };
      const previousData: PMPMInput = { totalCost: 120000, memberMonths: 1000 };

      const result = calculatePMPMWithTrend(currentData, previousData);

      expect(result.currentPMPM).toBe(130);
      expect(result.previousPMPM).toBe(120);
      expect(result.change).toBeCloseTo(10, 2);
      expect(result.changePercent).toBeCloseTo(8.33, 2);
      expect(result.trend).toBe('increasing');
    });

    it('should detect decreasing trend', () => {
      const currentData: PMPMInput = { totalCost: 110000, memberMonths: 1000 };
      const previousData: PMPMInput = { totalCost: 120000, memberMonths: 1000 };

      const result = calculatePMPMWithTrend(currentData, previousData);

      expect(result.trend).toBe('decreasing');
      expect(result.change).toBeLessThan(0);
    });

    it('should detect stable trend', () => {
      const currentData: PMPMInput = { totalCost: 120100, memberMonths: 1000 };
      const previousData: PMPMInput = { totalCost: 120000, memberMonths: 1000 };

      const result = calculatePMPMWithTrend(currentData, previousData);

      // 0.1 dollar change is < 2% threshold
      expect(result.trend).toBe('stable');
    });

    it('should handle different member months', () => {
      const currentData: PMPMInput = { totalCost: 130000, memberMonths: 1100 };
      const previousData: PMPMInput = { totalCost: 120000, memberMonths: 1000 };

      const result = calculatePMPMWithTrend(currentData, previousData);

      expect(result.currentPMPM).toBeCloseTo(118.18, 2);
      expect(result.previousPMPM).toBe(120);
      expect(result.trend).toBe('decreasing');
    });
  });

  describe('calculatePMPMByCategory', () => {
    const categoryData = [
      { category: 'Medical', totalCost: 80000 },
      { category: 'Pharmacy', totalCost: 30000 },
      { category: 'Dental', totalCost: 10000 },
    ];
    const totalMemberMonths = 1000;

    it('should calculate PMPM for all categories', () => {
      const result = calculatePMPMByCategory(categoryData, totalMemberMonths);

      expect(result).toHaveLength(3);
      expect(result[0].pmpm).toBe(80);
      expect(result[1].pmpm).toBe(30);
      expect(result[2].pmpm).toBe(10);
    });

    it('should calculate correct percentages', () => {
      const result = calculatePMPMByCategory(categoryData, totalMemberMonths);

      expect(result[0].percentage).toBeCloseTo(66.67, 1); // 80000/120000
      expect(result[1].percentage).toBe(25); // 30000/120000
      expect(result[2].percentage).toBeCloseTo(8.33, 1); // 10000/120000
    });

    it('should throw error for zero member months', () => {
      expect(() => calculatePMPMByCategory(categoryData, 0)).toThrow(
        'Total member months cannot be zero'
      );
    });

    it('should handle empty category list', () => {
      const result = calculatePMPMByCategory([], totalMemberMonths);
      expect(result).toHaveLength(0);
    });

    it('should handle single category', () => {
      const singleCategory = [{ category: 'Medical', totalCost: 100000 }];
      const result = calculatePMPMByCategory(singleCategory, totalMemberMonths);

      expect(result).toHaveLength(1);
      expect(result[0].percentage).toBe(100);
    });
  });

  describe('calculateMonthlyPMPMTrends', () => {
    const monthlyData = [
      { month: '2024-01', totalCost: 100000, memberMonths: 1000 },
      { month: '2024-02', totalCost: 105000, memberMonths: 1050 },
      { month: '2024-03', totalCost: 110000, memberMonths: 1100 },
      { month: '2024-04', totalCost: 108000, memberMonths: 1080 },
    ];

    it('should calculate trends for all months', () => {
      const result = calculateMonthlyPMPMTrends(monthlyData);

      expect(result).toHaveLength(4);
      expect(result[0].pmpm).toBe(100);
      expect(result[1].pmpm).toBe(100);
      expect(result[2].pmpm).toBe(100);
      expect(result[3].pmpm).toBe(100);
    });

    it('should calculate month-over-month changes', () => {
      const result = calculateMonthlyPMPMTrends(monthlyData);

      expect(result[0].change).toBe(0); // First month has no previous
      expect(result[1].change).toBe(0); // 100 - 100
      expect(result[2].change).toBe(0); // 100 - 100
    });

    it('should handle empty data', () => {
      const result = calculateMonthlyPMPMTrends([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single month', () => {
      const result = calculateMonthlyPMPMTrends([monthlyData[0]]);

      expect(result).toHaveLength(1);
      expect(result[0].change).toBe(0);
      expect(result[0].changePercent).toBe(0);
    });
  });

  describe('calculateRollingAveragePMPM', () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      totalCost: 100000 + i * 5000,
      memberMonths: 1000,
    }));

    it('should calculate 3-month rolling average', () => {
      const result = calculateRollingAveragePMPM(monthlyData, 3);

      expect(result.length).toBe(monthlyData.length - 2);
      expect(result[0].rollingPMPM).toBeDefined();
      expect(result[0].rollingTotalCost).toBeDefined();
      expect(result[0].rollingMemberMonths).toBeDefined();
    });

    it('should return empty array for insufficient data', () => {
      const shortData = monthlyData.slice(0, 2);
      const result = calculateRollingAveragePMPM(shortData, 3);

      expect(result).toHaveLength(0);
    });

    it('should calculate correct rolling totals', () => {
      const result = calculateRollingAveragePMPM(monthlyData, 3);

      // First 3 months: 100000 + 105000 + 110000 = 315000, 3000 member months
      expect(result[0].rollingTotalCost).toBe(315000);
      expect(result[0].rollingMemberMonths).toBe(3000);
      expect(result[0].rollingPMPM).toBe(105);
    });

    it('should handle custom rolling periods', () => {
      const result6 = calculateRollingAveragePMPM(monthlyData, 6);
      const result12 = calculateRollingAveragePMPM(monthlyData, 12);

      expect(result6.length).toBe(monthlyData.length - 5);
      expect(result12.length).toBe(1); // Only one 12-month period
    });
  });

  describe('calculatePMPMBenchmarks', () => {
    const actualPMPM = 120;

    it('should compare against industry benchmark', () => {
      const benchmarks = { industry: 150 };
      const result = calculatePMPMBenchmarks(actualPMPM, benchmarks);

      expect(result.performance.vsIndustry).toBeDefined();
      expect(result.performance.vsIndustry?.better).toBe(true);
      expect(result.performance.vsIndustry?.difference).toBe(-30);
    });

    it('should compare against target', () => {
      const benchmarks = { target: 125 };
      const result = calculatePMPMBenchmarks(actualPMPM, benchmarks);

      expect(result.performance.vsTarget).toBeDefined();
      expect(result.performance.vsTarget?.difference).toBe(-5);
    });

    it('should compare against previous period', () => {
      const benchmarks = { previous: 115 };
      const result = calculatePMPMBenchmarks(actualPMPM, benchmarks);

      expect(result.performance.vsPrevious).toBeDefined();
      expect(result.performance.vsPrevious?.improved).toBe(false); // Cost increased
    });

    it('should rank as excellent when significantly below industry', () => {
      const benchmarks = { industry: 150 };
      const result = calculatePMPMBenchmarks(120, benchmarks);

      expect(result.ranking).toBe('excellent');
    });

    it('should rank as good when moderately below industry', () => {
      const benchmarks = { industry: 130 };
      const result = calculatePMPMBenchmarks(120, benchmarks);

      expect(result.ranking).toBe('good');
    });

    it('should rank as average when close to industry', () => {
      const benchmarks = { industry: 125 };
      const result = calculatePMPMBenchmarks(120, benchmarks);

      expect(result.ranking).toBe('average');
    });
  });

  describe('calculatePMPMVarianceAnalysis', () => {
    const actualData = [
      {
        category: 'Medical',
        actualPMPM: 100,
        budgetPMPM: 95,
        memberMonths: 1000,
      },
      {
        category: 'Pharmacy',
        actualPMPM: 30,
        budgetPMPM: 35,
        memberMonths: 1000,
      },
      {
        category: 'Dental',
        actualPMPM: 10,
        budgetPMPM: 10,
        memberMonths: 1000,
      },
    ];

    it('should calculate variance for all categories', () => {
      const result = calculatePMPMVarianceAnalysis(actualData);

      expect(result).toHaveLength(3);
      expect(result[0].variance).toBe(5); // 100 - 95
      expect(result[1].variance).toBe(-5); // 30 - 35
      expect(result[2].variance).toBe(0);
    });

    it('should determine correct status', () => {
      const result = calculatePMPMVarianceAnalysis(actualData);

      expect(result[0].status).toBe('unfavorable'); // Over budget
      expect(result[1].status).toBe('favorable'); // Under budget
      expect(result[2].status).toBe('on-budget'); // On budget
    });

    it('should calculate dollar impact', () => {
      const result = calculatePMPMVarianceAnalysis(actualData);

      expect(result[0].dollarImpact).toBe(5000); // 5 * 1000
      expect(result[1].dollarImpact).toBe(-5000); // -5 * 1000
      expect(result[2].dollarImpact).toBe(0);
    });

    it('should calculate variance percentages', () => {
      const result = calculatePMPMVarianceAnalysis(actualData);

      expect(result[0].variancePercent).toBeCloseTo(5.26, 2);
      expect(result[1].variancePercent).toBeCloseTo(-14.29, 2);
      expect(result[2].variancePercent).toBe(0);
    });
  });

  describe('projectPMPM', () => {
    const historicalData = Array.from({ length: 12 }, (_, i) => ({
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      pmpm: 100 + i * 2, // Increasing trend
    }));

    it('should project future PMPM values', () => {
      const result = projectPMPM(historicalData, 3);

      expect(result).toHaveLength(3);
      expect(result[0].projectedPMPM).toBeGreaterThan(0);
      expect(result[0].confidence).toBeGreaterThanOrEqual(0);
      expect(result[0].confidence).toBeLessThanOrEqual(1);
    });

    it('should throw error for insufficient data', () => {
      const shortData = historicalData.slice(0, 4);
      expect(() => projectPMPM(shortData, 3)).toThrow(
        'Insufficient historical data for projection'
      );
    });

    it('should generate future month strings', () => {
      const result = projectPMPM(historicalData, 3);

      result.forEach(projection => {
        expect(projection.month).toMatch(/^\d{4}-\d{2}$/);
      });
    });

    it('should ensure non-negative projections', () => {
      const result = projectPMPM(historicalData, 6);

      result.forEach(projection => {
        expect(projection.projectedPMPM).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate confidence based on trend strength', () => {
      const result = projectPMPM(historicalData, 3);

      // With a clear linear trend, confidence should be high
      expect(result[0].confidence).toBeGreaterThan(0.9);
    });
  });

  describe('analyzePMPMCostDrivers', () => {
    const currentPeriod = {
      categories: [
        { category: 'Medical', cost: 100000, utilization: 500, unitCost: 200 },
        { category: 'Pharmacy', cost: 30000, utilization: 1000, unitCost: 30 },
      ],
      memberMonths: 1000,
    };

    const previousPeriod = {
      categories: [
        { category: 'Medical', cost: 90000, utilization: 450, unitCost: 200 },
        { category: 'Pharmacy', cost: 28000, utilization: 1000, unitCost: 28 },
      ],
      memberMonths: 900,
    };

    it('should analyze cost drivers for all categories', () => {
      const result = analyzePMPMCostDrivers(currentPeriod, previousPeriod);

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('Medical');
      expect(result[1].category).toBe('Pharmacy');
    });

    it('should calculate PMPM changes', () => {
      const result = analyzePMPMCostDrivers(currentPeriod, previousPeriod);

      expect(result[0].pmpmChange).toBeGreaterThan(0); // Medical increased
      expect(result[1].pmpmChange).toBeGreaterThan(0); // Pharmacy increased
    });

    it('should decompose changes into drivers', () => {
      const result = analyzePMPMCostDrivers(currentPeriod, previousPeriod);

      expect(result[0].drivers.utilizationImpact).toBeDefined();
      expect(result[0].drivers.unitCostImpact).toBeDefined();
      expect(result[0].drivers.membershipImpact).toBeDefined();
    });

    it('should identify primary driver', () => {
      const result = analyzePMPMCostDrivers(currentPeriod, previousPeriod);

      expect(result[0].primaryDriver).toMatch(/utilization|unit-cost|membership/);
      expect(result[1].primaryDriver).toMatch(/utilization|unit-cost|membership/);
    });

    it('should handle new categories', () => {
      const currentWithNew = {
        ...currentPeriod,
        categories: [
          ...currentPeriod.categories,
          { category: 'Dental', cost: 10000, utilization: 100, unitCost: 100 },
        ],
      };

      const result = analyzePMPMCostDrivers(currentWithNew, previousPeriod);

      expect(result).toHaveLength(3);
      expect(result[2].category).toBe('Dental');
      expect(result[2].drivers.utilizationImpact).toBe(0);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle very large numbers', () => {
      const result = calculatePMPM(10000000000, 1000000);
      expect(result).toBe(10000);
    });

    it('should handle very small numbers', () => {
      const result = calculatePMPM(0.50, 1);
      expect(result).toBe(0.50);
    });

    it('should handle decimal precision', () => {
      const result = calculatePMPM(123456.789, 1234.567);
      expect(result).toBeCloseTo(100.0, 1);
    });

    it('should integrate PMPM with member months calculation', () => {
      const enrollment = 500;
      const months = 12;
      const totalCost = 600000;

      const memberMonths = calculateMemberMonths(enrollment, months);
      const pmpm = calculatePMPM(totalCost, memberMonths);

      expect(memberMonths).toBe(6000);
      expect(pmpm).toBe(100);
    });
  });
});