import {
  createPDF,
  formatPDFCurrency,
  formatPDFPercentage,
  formatPDFDate,
  getFuelGaugeColor,
} from '../pdfGenerator';

describe('pdfGenerator utilities', () => {
  describe('createPDF', () => {
    it('should create a jsPDF instance with correct orientation', () => {
      const pdf = createPDF();
      expect(pdf).toBeDefined();
      expect(pdf.internal.pageSize.getWidth()).toBeGreaterThan(pdf.internal.pageSize.getHeight()); // Landscape
    });
  });

  describe('formatPDFCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatPDFCurrency(1234567.89)).toBe('$1,234,567.89');
      expect(formatPDFCurrency(1000)).toBe('$1,000.00');
      expect(formatPDFCurrency(0)).toBe('$0.00');
    });

    it('should format negative amounts with parentheses', () => {
      expect(formatPDFCurrency(-5000)).toBe('($5,000.00)');
      expect(formatPDFCurrency(-123.45)).toBe('($123.45)');
    });

    it('should handle decimals correctly', () => {
      expect(formatPDFCurrency(99.99)).toBe('$99.99');
      expect(formatPDFCurrency(100.5)).toBe('$100.50');
    });
  });

  describe('formatPDFPercentage', () => {
    it('should format percentages with 1 decimal place', () => {
      expect(formatPDFPercentage(95.456)).toBe('95.5%');
      expect(formatPDFPercentage(100)).toBe('100.0%');
      expect(formatPDFPercentage(0)).toBe('0.0%');
    });

    it('should handle negative percentages', () => {
      expect(formatPDFPercentage(-5.5)).toBe('-5.5%');
    });

    it('should round correctly', () => {
      expect(formatPDFPercentage(99.94)).toBe('99.9%');
      expect(formatPDFPercentage(99.95)).toBe('100.0%');
    });
  });

  describe('formatPDFDate', () => {
    it('should format dates in MM/DD/YYYY format', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const result = formatPDFDate(date);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/); // Matches MM/DD/YYYY pattern
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date('2024-12-31');
      const result1 = formatPDFDate(date1);
      expect(result1).toContain('2024');

      const date2 = new Date('2025-06-15');
      const result2 = formatPDFDate(date2);
      expect(result2).toContain('2025');
    });
  });

  describe('getFuelGaugeColor', () => {
    it('should return green for values under 95%', () => {
      const color = getFuelGaugeColor(90);
      expect(color).toEqual([34, 197, 94]); // Green
    });

    it('should return green for exactly 95%', () => {
      const color = getFuelGaugeColor(95);
      expect(color).toEqual([34, 197, 94]); // Green (< 95 means <= 95)
    });

    it('should return yellow for values between 95% and 105%', () => {
      const colorAt96 = getFuelGaugeColor(96);
      expect(colorAt96).toEqual([251, 191, 36]); // Yellow

      const colorAt100 = getFuelGaugeColor(100);
      expect(colorAt100).toEqual([251, 191, 36]); // Yellow

      const colorAt105 = getFuelGaugeColor(105);
      expect(colorAt105).toEqual([251, 191, 36]); // Yellow
    });

    it('should return red for values over 105%', () => {
      const colorAt106 = getFuelGaugeColor(106);
      expect(colorAt106).toEqual([239, 68, 68]); // Red

      const colorAt120 = getFuelGaugeColor(120);
      expect(colorAt120).toEqual([239, 68, 68]); // Red
    });

    it('should handle edge cases', () => {
      const colorAt0 = getFuelGaugeColor(0);
      expect(colorAt0).toEqual([34, 197, 94]); // Green

      const colorAt200 = getFuelGaugeColor(200);
      expect(colorAt200).toEqual([239, 68, 68]); // Red
    });
  });
});
