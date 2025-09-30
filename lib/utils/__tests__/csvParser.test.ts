import {
  parseExperienceDataCSV,
  parseHighCostClaimantCSV,
  detectCSVType,
  generateExperienceDataTemplate,
  generateHighCostClaimantTemplate,
} from '../csvParser';

// Mock File constructor for testing
class MockFile extends Blob {
  name: string;
  lastModified: number;

  constructor(parts: BlobPart[], filename: string, options?: FilePropertyBag) {
    super(parts, options);
    this.name = filename;
    this.lastModified = Date.now();
  }

  // Add text() method for compatibility
  async text(): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(this);
    });
  }
}

// Helper to create mock CSV files
function createMockCSVFile(content: string, filename: string): File {
  return new MockFile([content], filename, { type: 'text/csv' }) as unknown as File;
}

describe('CSV Parser', () => {
  describe('parseExperienceDataCSV', () => {
    const validExperienceCSV = `Month,Domestic_Medical_IP,Domestic_Medical_OP,Non_Domestic_Medical,Prescription_Drugs,Dental,Vision,Mental_Health,Preventive_Care,Emergency_Room,Urgent_Care,Specialty_Care,Lab_Diagnostic,Physical_Therapy,DME,Home_Health,Enrollment
2024-01,125000,89000,15000,45000,12000,3500,18000,8500,25000,12000,35000,15000,8000,5000,7500,1200
2024-02,132000,92000,18000,47000,11500,3200,19500,9000,28000,13500,38000,16500,8500,5500,8000,1195`;

    it('should successfully parse valid experience data CSV', async () => {
      const file = createMockCSVFile(validExperienceCSV, 'experience.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.success).toBe(true);
      expect(result.validRows).toBe(2);
      expect(result.totalRows).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toHaveLength(2);
    });

    it('should validate required headers', async () => {
      const invalidCSV = `Month,Claims,Fees
2024-01,100000,20000`;
      const file = createMockCSVFile(invalidCSV, 'invalid.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Missing required columns');
    });

    it('should reject files over size limit', async () => {
      const largeContent = 'a'.repeat(60 * 1024 * 1024); // 60MB
      const file = createMockCSVFile(largeContent, 'large.csv');
      const result = await parseExperienceDataCSV(file, { maxFileSize: 50 * 1024 * 1024 });

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('File size');
      expect(result.errors[0].message).toContain('exceeds maximum');
    });

    it('should reject non-CSV files', async () => {
      const file = createMockCSVFile('data', 'document.txt');
      const result = await parseExperienceDataCSV(file);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('must be a CSV file');
    });

    it('should handle empty CSV files', async () => {
      const file = createMockCSVFile('', 'empty.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.success).toBe(false);
      expect(result.totalRows).toBe(0);
    });

    it('should transform and validate numeric fields', async () => {
      const file = createMockCSVFile(validExperienceCSV, 'experience.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.data[0].domesticMedicalIP).toBe(125000);
      expect(result.data[0].enrollment).toBe(1200);
      expect(typeof result.data[0].domesticMedicalIP).toBe('number');
    });

    it('should validate date format', async () => {
      const csvWithInvalidDate = validExperienceCSV.replace('2024-01', 'invalid-date');
      const file = createMockCSVFile(csvWithInvalidDate, 'invalid-date.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.column === 'validation')).toBe(true);
    });

    it('should handle CSV with extra whitespace', async () => {
      const csvWithSpaces = validExperienceCSV.replace(/,/g, ' , ');
      const file = createMockCSVFile(csvWithSpaces, 'spaces.csv');
      const result = await parseExperienceDataCSV(file);

      // Should still parse successfully with trim enabled
      expect(result.validRows).toBeGreaterThan(0);
    });

    it('should generate unique IDs for each row', async () => {
      const file = createMockCSVFile(validExperienceCSV, 'experience.csv');
      const result = await parseExperienceDataCSV(file);

      const ids = result.data.map(d => d.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('parseHighCostClaimantCSV', () => {
    const validClaimantCSV = `Member_ID,Age,Gender,Primary_Diagnosis_Code,Primary_Diagnosis_Description,Total_Paid_Amount,Claim_Count,Enrollment_Months,Risk_Score
M001,45,M,E11.9,Type 2 diabetes mellitus without complications,125000,24,12,2.8
M002,67,F,I25.10,Atherosclerotic heart disease of native coronary artery,89000,18,12,3.2`;

    it('should successfully parse valid high-cost claimant CSV', async () => {
      const file = createMockCSVFile(validClaimantCSV, 'claimants.csv');
      const result = await parseHighCostClaimantCSV(file);

      expect(result.success).toBe(true);
      expect(result.validRows).toBe(2);
      expect(result.totalRows).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toHaveLength(2);
    });

    it('should validate required headers for claimant data', async () => {
      const invalidCSV = `Member_ID,Age
M001,45`;
      const file = createMockCSVFile(invalidCSV, 'invalid-claimants.csv');
      const result = await parseHighCostClaimantCSV(file);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('Missing required columns');
    });

    it('should validate gender field', async () => {
      const csvWithInvalidGender = validClaimantCSV.replace(',M,', ',X,');
      const file = createMockCSVFile(csvWithInvalidGender, 'invalid-gender.csv');
      const result = await parseHighCostClaimantCSV(file);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.message.includes('Gender'))).toBe(true);
    });

    it('should transform numeric fields correctly', async () => {
      const file = createMockCSVFile(validClaimantCSV, 'claimants.csv');
      const result = await parseHighCostClaimantCSV(file);

      expect(result.data[0].age).toBe(45);
      expect(result.data[0].totalPaidAmount).toBe(125000);
      expect(result.data[0].riskScore).toBe(2.8);
      expect(typeof result.data[0].age).toBe('number');
    });

    it('should preserve string fields', async () => {
      const file = createMockCSVFile(validClaimantCSV, 'claimants.csv');
      const result = await parseHighCostClaimantCSV(file);

      expect(result.data[0].memberId).toBe('M001');
      expect(result.data[0].primaryDiagnosisCode).toBe('E11.9');
      expect(result.data[0].primaryDiagnosisDescription).toContain('diabetes');
    });

    it('should trim whitespace from string fields', async () => {
      const csvWithSpaces = validClaimantCSV.replace('M001', '  M001  ');
      const file = createMockCSVFile(csvWithSpaces, 'spaces.csv');
      const result = await parseHighCostClaimantCSV(file);

      expect(result.data[0].memberId).toBe('M001');
    });

    it('should reject files over size limit', async () => {
      const largeContent = 'a'.repeat(60 * 1024 * 1024);
      const file = createMockCSVFile(largeContent, 'large-claimants.csv');
      const result = await parseHighCostClaimantCSV(file, { maxFileSize: 50 * 1024 * 1024 });

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('File size exceeds');
    });
  });

  describe('detectCSVType', () => {
    it('should detect experience data CSV', () => {
      const headers = [
        'Month',
        'Domestic_Medical_IP',
        'Domestic_Medical_OP',
        'Enrollment',
      ];
      const result = detectCSVType(headers);
      expect(result).toBe('experience');
    });

    it('should detect high-cost claimant CSV', () => {
      const headers = [
        'Member_ID',
        'Age',
        'Gender',
        'Primary_Diagnosis_Code',
        'Total_Paid_Amount',
      ];
      const result = detectCSVType(headers);
      expect(result).toBe('high-cost-claimant');
    });

    it('should return unknown for unrecognized headers', () => {
      const headers = ['Column1', 'Column2', 'Column3'];
      const result = detectCSVType(headers);
      expect(result).toBe('unknown');
    });

    it('should handle partial header matches', () => {
      const headers = ['Month', 'Claims']; // Has Month but missing other required headers
      const result = detectCSVType(headers);
      expect(result).toBe('unknown');
    });

    it('should handle empty headers', () => {
      const result = detectCSVType([]);
      expect(result).toBe('unknown');
    });
  });

  describe('Template Generation', () => {
    describe('generateExperienceDataTemplate', () => {
      it('should generate valid experience data template', () => {
        const template = generateExperienceDataTemplate();

        expect(template).toContain('Month');
        expect(template).toContain('Domestic_Medical_IP');
        expect(template).toContain('Enrollment');
        expect(template.split('\n').length).toBeGreaterThan(1); // Headers + data rows
      });

      it('should include sample data rows', () => {
        const template = generateExperienceDataTemplate();
        const lines = template.split('\n');

        expect(lines.length).toBeGreaterThanOrEqual(3); // Header + 2 sample rows
        expect(lines[1]).toContain('2024-01');
        expect(lines[2]).toContain('2024-02');
      });

      it('should have valid CSV format', () => {
        const template = generateExperienceDataTemplate();
        const lines = template.split('\n');

        lines.forEach(line => {
          expect(line.split(',').length).toBeGreaterThan(10); // Should have many columns
        });
      });

      it('should be parseable by CSV parser', async () => {
        const template = generateExperienceDataTemplate();
        const file = createMockCSVFile(template, 'template.csv');
        const result = await parseExperienceDataCSV(file);

        expect(result.success).toBe(true);
        expect(result.validRows).toBeGreaterThan(0);
      });
    });

    describe('generateHighCostClaimantTemplate', () => {
      it('should generate valid high-cost claimant template', () => {
        const template = generateHighCostClaimantTemplate();

        expect(template).toContain('Member_ID');
        expect(template).toContain('Age');
        expect(template).toContain('Gender');
        expect(template).toContain('Primary_Diagnosis_Code');
        expect(template.split('\n').length).toBeGreaterThan(1);
      });

      it('should include sample data with valid diagnoses', () => {
        const template = generateHighCostClaimantTemplate();
        const lines = template.split('\n');

        expect(lines[1]).toContain('E11.9'); // ICD-10 code
        expect(lines[1]).toContain('diabetes');
        expect(lines[2]).toContain('I25.10'); // ICD-10 code
      });

      it('should have valid gender values', () => {
        const template = generateHighCostClaimantTemplate();

        expect(template).toContain(',M,');
        expect(template).toContain(',F,');
      });

      it('should be parseable by CSV parser', async () => {
        const template = generateHighCostClaimantTemplate();
        const file = createMockCSVFile(template, 'claimants-template.csv');
        const result = await parseHighCostClaimantCSV(file);

        expect(result.success).toBe(true);
        expect(result.validRows).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle CSV with invalid numeric values', async () => {
      const invalidCSV = `Month,Domestic_Medical_IP,Domestic_Medical_OP,Non_Domestic_Medical,Prescription_Drugs,Dental,Vision,Mental_Health,Preventive_Care,Emergency_Room,Urgent_Care,Specialty_Care,Lab_Diagnostic,Physical_Therapy,DME,Home_Health,Enrollment
2024-01,abc,89000,15000,45000,12000,3500,18000,8500,25000,12000,35000,15000,8000,5000,7500,1200`;

      const file = createMockCSVFile(invalidCSV, 'invalid-numbers.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.column === 'validation')).toBe(true);
    });

    it('should handle CSV with negative values', async () => {
      const negativeCSV = `Month,Domestic_Medical_IP,Domestic_Medical_OP,Non_Domestic_Medical,Prescription_Drugs,Dental,Vision,Mental_Health,Preventive_Care,Emergency_Room,Urgent_Care,Specialty_Care,Lab_Diagnostic,Physical_Therapy,DME,Home_Health,Enrollment
2024-01,-125000,89000,15000,45000,12000,3500,18000,8500,25000,12000,35000,15000,8000,5000,7500,1200`;

      const file = createMockCSVFile(negativeCSV, 'negative.csv');
      const result = await parseExperienceDataCSV(file);

      // Should fail validation for negative values
      expect(result.success).toBe(false);
    });

    it('should handle CSV with empty cells', async () => {
      const emptyCSV = `Month,Domestic_Medical_IP,Domestic_Medical_OP,Non_Domestic_Medical,Prescription_Drugs,Dental,Vision,Mental_Health,Preventive_Care,Emergency_Room,Urgent_Care,Specialty_Care,Lab_Diagnostic,Physical_Therapy,DME,Home_Health,Enrollment
2024-01,,89000,15000,45000,12000,3500,18000,8500,25000,12000,35000,15000,8000,5000,7500,1200`;

      const file = createMockCSVFile(emptyCSV, 'empty-cells.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.success).toBe(false);
    });

    it('should handle very large valid numbers', async () => {
      const largeNumberCSV = `Month,Domestic_Medical_IP,Domestic_Medical_OP,Non_Domestic_Medical,Prescription_Drugs,Dental,Vision,Mental_Health,Preventive_Care,Emergency_Room,Urgent_Care,Specialty_Care,Lab_Diagnostic,Physical_Therapy,DME,Home_Health,Enrollment
2024-01,999999999,89000,15000,45000,12000,3500,18000,8500,25000,12000,35000,15000,8000,5000,7500,1200`;

      const file = createMockCSVFile(largeNumberCSV, 'large-numbers.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.validRows).toBeGreaterThan(0);
      expect(result.data[0].domesticMedicalIP).toBe(999999999);
    });

    it('should provide row numbers in error messages', async () => {
      const invalidCSV = `Month,Domestic_Medical_IP,Domestic_Medical_OP,Non_Domestic_Medical,Prescription_Drugs,Dental,Vision,Mental_Health,Preventive_Care,Emergency_Room,Urgent_Care,Specialty_Care,Lab_Diagnostic,Physical_Therapy,DME,Home_Health,Enrollment
2024-01,125000,89000,15000,45000,12000,3500,18000,8500,25000,12000,35000,15000,8000,5000,7500,1200
invalid-date,132000,92000,18000,47000,11500,3200,19500,9000,28000,13500,38000,16500,8500,5500,8000,1195`;

      const file = createMockCSVFile(invalidCSV, 'with-errors.csv');
      const result = await parseExperienceDataCSV(file);

      expect(result.errors.some(e => e.row === 2)).toBe(true);
      expect(result.validRows).toBe(1); // Only first row is valid
    });
  });
});