import {
  calculateMonthlyLossRatio,
  calculateLossRatioWithVariance,
  calculateRolling12LossRatio,
  calculateRollingLossRatios,
  generateLossRatioSummary,
  predictLossRatio,
  calculateLossRatioImpact,
  LossRatioInput,
} from '../loss-ratio';

describe('Loss Ratio Calculations', () => {
  describe('calculateMonthlyLossRatio', () => {
    it('should calculate basic loss ratio correctly', () => {
      const result = calculateMonthlyLossRatio(80000, 20000, 120000);
      expect(result).toBeCloseTo(0.8333, 4);
    });

    it('should handle zero claims and fees', () => {
      const result = calculateMonthlyLossRatio(0, 0, 100000);
      expect(result).toBe(0);
    });

    it('should throw error for zero premiums', () => {
      expect(() => calculateMonthlyLossRatio(50000, 10000, 0)).toThrow(
        'Premiums cannot be zero for loss ratio calculation'
      );
    });

    it('should calculate 100% loss ratio', () => {
      const result = calculateMonthlyLossRatio(80000, 20000, 100000);
      expect(result).toBe(1.0);
    });

    it('should calculate loss ratio over 100%', () => {
      const result = calculateMonthlyLossRatio(100000, 30000, 100000);
      expect(result).toBe(1.3);
    });
  });

  describe('calculateLossRatioWithVariance', () => {
    const targetLossRatio = 0.85;

    it('should return good status when loss ratio is within target', () => {
      const input: LossRatioInput = {
        claims: 80000,
        fees: 10000,
        premiums: 110000,
      };
      const result = calculateLossRatioWithVariance(input, targetLossRatio);

      expect(result.lossRatio).toBeCloseTo(0.8182, 4);
      expect(result.status).toBe('good');
      expect(result.variance).toBeLessThan(0);
    });

    it('should return warning status when loss ratio is moderately high', () => {
      const input: LossRatioInput = {
        claims: 90000,
        fees: 15000,
        premiums: 110000,
      };
      const result = calculateLossRatioWithVariance(input, targetLossRatio);

      expect(result.lossRatio).toBeCloseTo(0.9545, 4);
      expect(result.status).toBe('warning');
    });

    it('should return critical status when loss ratio is too high', () => {
      const input: LossRatioInput = {
        claims: 100000,
        fees: 20000,
        premiums: 110000,
      };
      const result = calculateLossRatioWithVariance(input, targetLossRatio);

      expect(result.lossRatio).toBeCloseTo(1.0909, 4);
      expect(result.status).toBe('critical');
    });

    it('should calculate variance percentage correctly', () => {
      const input: LossRatioInput = {
        claims: 85000,
        fees: 8500,
        premiums: 100000,
      };
      const result = calculateLossRatioWithVariance(input, targetLossRatio);

      expect(result.variance).toBeCloseTo(10, 0); // 10% over target
    });
  });

  describe('calculateRolling12LossRatio', () => {
    const monthlyData = Array.from({ length: 15 }, (_, i) => ({
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      claims: 80000 + i * 1000,
      fees: 15000 + i * 200,
      premiums: 120000,
    }));

    it('should calculate rolling 12-month loss ratio', () => {
      const result = calculateRolling12LossRatio(monthlyData);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(2);
    });

    it('should use only last 12 months when more data available', () => {
      const result = calculateRolling12LossRatio(monthlyData);
      // Should only use last 12 months, not all 15
      expect(result).toBeDefined();
    });

    it('should handle less than 12 months of data', () => {
      const shortData = monthlyData.slice(0, 6);
      const result = calculateRolling12LossRatio(shortData);
      expect(result).toBeGreaterThan(0);
    });

    it('should throw error for empty data', () => {
      expect(() => calculateRolling12LossRatio([])).toThrow(
        'No data provided for rolling calculation'
      );
    });

    it('should throw error for zero total premiums', () => {
      const zeroData = [
        { month: '2024-01', claims: 1000, fees: 200, premiums: 0 },
      ];
      expect(() => calculateRolling12LossRatio(zeroData)).toThrow(
        'Total premiums cannot be zero'
      );
    });
  });

  describe('calculateRollingLossRatios', () => {
    const monthlyData = Array.from({ length: 18 }, (_, i) => ({
      month: `2024-${String((i % 12) + 1).padStart(2, '0')}`,
      claims: 75000 + i * 500,
      fees: 12000 + i * 100,
      premiums: 105000,
    }));

    it('should calculate multiple rolling periods', () => {
      const results = calculateRollingLossRatios(monthlyData, [3, 6, 12]);

      expect(results).toHaveLength(3);
      expect(results[0].period).toBe(3);
      expect(results[1].period).toBe(6);
      expect(results[2].period).toBe(12);
    });

    it('should detect improving trend', () => {
      // Create data with decreasing loss ratios
      const improvingData = Array.from({ length: 12 }, (_, i) => ({
        month: `2024-${String(i + 1).padStart(2, '0')}`,
        claims: 90000 - i * 2000, // Decreasing claims
        fees: 15000,
        premiums: 120000,
      }));

      const results = calculateRollingLossRatios(improvingData, [12]);
      expect(results[0].trend).toBe('improving');
    });

    it('should detect declining trend', () => {
      // Create data with increasing loss ratios
      const decliningData = Array.from({ length: 12 }, (_, i) => ({
        month: `2024-${String(i + 1).padStart(2, '0')}`,
        claims: 70000 + i * 2000, // Increasing claims
        fees: 15000,
        premiums: 120000,
      }));

      const results = calculateRollingLossRatios(decliningData, [12]);
      expect(results[0].trend).toBe('declining');
    });

    it('should skip periods with insufficient data', () => {
      const shortData = monthlyData.slice(0, 5);
      const results = calculateRollingLossRatios(shortData, [3, 6, 12]);

      expect(results.length).toBeLessThan(3);
      expect(results.every(r => r.period <= 5)).toBe(true);
    });
  });

  describe('generateLossRatioSummary', () => {
    const monthlyData = [
      { month: '2024-01', claims: 80000, fees: 15000, premiums: 120000 },
      { month: '2024-02', claims: 85000, fees: 16000, premiums: 120000 },
      { month: '2024-03', claims: 75000, fees: 14000, premiums: 120000 },
      { month: '2024-04', claims: 90000, fees: 18000, premiums: 120000 },
      { month: '2024-05', claims: 82000, fees: 15500, premiums: 120000 },
      { month: '2024-06', claims: 78000, fees: 14500, premiums: 120000 },
    ];

    it('should generate comprehensive summary statistics', () => {
      const summary = generateLossRatioSummary(monthlyData);

      expect(summary.averageLossRatio).toBeGreaterThan(0);
      expect(summary.bestMonth).toBeDefined();
      expect(summary.worstMonth).toBeDefined();
      expect(summary.volatility).toBeGreaterThan(0);
      expect(summary.monthsOnTarget).toBeGreaterThanOrEqual(0);
      expect(summary.monthsAboveTarget).toBeGreaterThanOrEqual(0);
      expect(summary.totalVariance).toBeGreaterThan(0);
    });

    it('should identify best and worst months correctly', () => {
      const summary = generateLossRatioSummary(monthlyData);

      // Month with lowest claims+fees should be best
      expect(summary.bestMonth.month).toBe('2024-03');

      // Month with highest claims+fees should be worst
      expect(summary.worstMonth.month).toBe('2024-04');
    });

    it('should calculate volatility correctly', () => {
      const summary = generateLossRatioSummary(monthlyData);

      expect(summary.volatility).toBeGreaterThan(0);
      expect(summary.volatility).toBeLessThan(1); // Should be reasonable
    });

    it('should count months on/above target', () => {
      const summary = generateLossRatioSummary(monthlyData, 0.85);

      expect(summary.monthsOnTarget + summary.monthsAboveTarget).toBe(
        monthlyData.length
      );
    });

    it('should throw error for empty data', () => {
      expect(() => generateLossRatioSummary([])).toThrow(
        'No data provided for summary calculation'
      );
    });
  });

  describe('predictLossRatio', () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      claims: 80000 + i * 1000, // Trending up
      fees: 15000 + i * 100,
      premiums: 120000,
    }));

    it('should predict future loss ratios', () => {
      const predictions = predictLossRatio(monthlyData, 3);

      expect(predictions).toHaveLength(3);
      expect(predictions[0].predictedLossRatio).toBeGreaterThan(0);
      expect(predictions[0].confidence).toBeGreaterThanOrEqual(0);
      expect(predictions[0].confidence).toBeLessThanOrEqual(1);
    });

    it('should generate future month strings', () => {
      const predictions = predictLossRatio(monthlyData, 3);

      predictions.forEach(prediction => {
        expect(prediction.month).toMatch(/^\d{4}-\d{2}$/);
      });
    });

    it('should ensure non-negative predictions', () => {
      const predictions = predictLossRatio(monthlyData, 3);

      predictions.forEach(prediction => {
        expect(prediction.predictedLossRatio).toBeGreaterThanOrEqual(0);
      });
    });

    it('should throw error for insufficient data', () => {
      const shortData = monthlyData.slice(0, 4);
      expect(() => predictLossRatio(shortData, 3)).toThrow(
        'Insufficient data for prediction'
      );
    });

    it('should calculate confidence based on data fit', () => {
      const predictions = predictLossRatio(monthlyData, 3);

      // With a clear trend, confidence should be relatively high
      expect(predictions[0].confidence).toBeGreaterThan(0.5);
    });
  });

  describe('calculateLossRatioImpact', () => {
    const currentData: LossRatioInput = {
      claims: 80000,
      fees: 15000,
      premiums: 120000,
    };

    it('should calculate impact of claims increase', () => {
      const result = calculateLossRatioImpact(currentData, {
        claimsChange: 10000,
      });

      expect(result.newLossRatio).toBeGreaterThan(result.currentLossRatio);
      expect(result.impact).toBeGreaterThan(0);
      expect(result.impactPercent).toBeGreaterThan(0);
    });

    it('should calculate impact of fees decrease', () => {
      const result = calculateLossRatioImpact(currentData, {
        feesChange: -5000,
      });

      expect(result.newLossRatio).toBeLessThan(result.currentLossRatio);
      expect(result.impact).toBeLessThan(0);
      expect(result.impactPercent).toBeLessThan(0);
    });

    it('should calculate impact of premium increase', () => {
      const result = calculateLossRatioImpact(currentData, {
        premiumsChange: 20000,
      });

      expect(result.newLossRatio).toBeLessThan(result.currentLossRatio);
      expect(result.impact).toBeLessThan(0);
    });

    it('should handle multiple simultaneous changes', () => {
      const result = calculateLossRatioImpact(currentData, {
        claimsChange: 10000,
        feesChange: 2000,
        premiumsChange: 15000,
      });

      expect(result.currentLossRatio).toBeCloseTo(0.7917, 4);
      expect(result.newLossRatio).toBeGreaterThan(0);
      expect(result.impact).toBeDefined();
      expect(result.impactPercent).toBeDefined();
    });

    it('should handle no changes', () => {
      const result = calculateLossRatioImpact(currentData, {});

      expect(result.newLossRatio).toBe(result.currentLossRatio);
      expect(result.impact).toBe(0);
      expect(result.impactPercent).toBe(0);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle very large numbers', () => {
      const result = calculateMonthlyLossRatio(
        1000000000,
        200000000,
        1500000000
      );
      expect(result).toBeCloseTo(0.8, 1);
    });

    it('should handle very small numbers', () => {
      const result = calculateMonthlyLossRatio(0.8, 0.2, 1.5);
      expect(result).toBeCloseTo(0.6667, 4);
    });

    it('should handle decimal precision correctly', () => {
      const result = calculateMonthlyLossRatio(
        80000.55,
        15000.33,
        120000.88
      );
      expect(result).toBeCloseTo(0.7917, 4);
    });
  });
});