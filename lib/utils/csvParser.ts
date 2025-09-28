import Papa from 'papaparse';
import { 
  validateExperienceDataCSV, 
  validateHighCostClaimantCSV,
  validateNumericString,
  validateDateString,
  validateGender
} from '@/lib/validations/schemas';
import { ExperienceData, HighCostClaimant, CSVValidationError } from '@/types/healthcare';

type ParsedCSVRow = Record<string, string>;

export interface CSVParseResult<T> {
  success: boolean;
  data: T[];
  errors: CSVValidationError[];
  totalRows: number;
  validRows: number;
  fileName: string;
}

export interface CSVParseOptions {
  maxFileSize?: number; // in bytes, default 50MB
  skipEmptyLines?: boolean;
  trimHeaders?: boolean;
  delimiter?: string;
}

const DEFAULT_OPTIONS: Required<CSVParseOptions> = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  skipEmptyLines: true,
  trimHeaders: true,
  delimiter: ','
};

/**
 * Parse and validate Experience Data CSV file
 */
export async function parseExperienceDataCSV(
  file: File,
  options: CSVParseOptions = {}
): Promise<CSVParseResult<ExperienceData>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate file size
  if (file.size > opts.maxFileSize) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: 'file',
        message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(opts.maxFileSize / 1024 / 1024).toFixed(2)}MB)`,
        value: file.size
      }],
      totalRows: 0,
      validRows: 0,
      fileName: file.name
    };
  }

  // Validate file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: 'file',
        message: 'File must be a CSV file',
        value: file.name
      }],
      totalRows: 0,
      validRows: 0,
      fileName: file.name
    };
  }

  try {
    const csvText = await file.text();
    
    return new Promise((resolve) => {
      Papa.parse<ParsedCSVRow>(csvText, {
        header: true,
        skipEmptyLines: opts.skipEmptyLines,
        delimiter: opts.delimiter,
        transformHeader: opts.trimHeaders ? (header: string) => header.trim() : undefined,
        complete: (results) => {
          const parseResult = processExperienceDataResults(results, file.name);
          resolve(parseResult);
        },
        error: (error: Error) => {
          resolve({
            success: false,
            data: [],
            errors: [{
              row: 0,
              column: 'parse',
              message: `CSV parsing error: ${error.message}`,
              value: error
            }],
            totalRows: 0,
            validRows: 0,
            fileName: file.name
          });
        }
      });
    });
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: 'file',
        message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        value: error
      }],
      totalRows: 0,
      validRows: 0,
      fileName: file.name
    };
  }
}

/**
 * Parse and validate High Cost Claimant CSV file
 */
export async function parseHighCostClaimantCSV(
  file: File,
  options: CSVParseOptions = {}
): Promise<CSVParseResult<HighCostClaimant>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate file size
  if (file.size > opts.maxFileSize) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: 'file',
        message: `File size exceeds maximum allowed size`,
        value: file.size
      }],
      totalRows: 0,
      validRows: 0,
      fileName: file.name
    };
  }

  try {
    const csvText = await file.text();
    
    return new Promise((resolve) => {
      Papa.parse<ParsedCSVRow>(csvText, {
        header: true,
        skipEmptyLines: opts.skipEmptyLines,
        delimiter: opts.delimiter,
        transformHeader: opts.trimHeaders ? (header: string) => header.trim() : undefined,
        complete: (results) => {
          const parseResult = processHighCostClaimantResults(results, file.name);
          resolve(parseResult);
        },
        error: (error: Error) => {
          resolve({
            success: false,
            data: [],
            errors: [{
              row: 0,
              column: 'parse',
              message: `CSV parsing error: ${error.message}`,
              value: error
            }],
            totalRows: 0,
            validRows: 0,
            fileName: file.name
          });
        }
      });
    });
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: 'file',
        message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        value: error
      }],
      totalRows: 0,
      validRows: 0,
      fileName: file.name
    };
  }
}

/**
 * Process Experience Data CSV parse results
 */
function processExperienceDataResults(
  results: Papa.ParseResult<ParsedCSVRow>,
  fileName: string
): CSVParseResult<ExperienceData> {
  const errors: CSVValidationError[] = [];
  const validData: ExperienceData[] = [];
  
  // Check for parsing errors
  if (results.errors.length > 0) {
    results.errors.forEach(error => {
      errors.push({
        row: error.row || 0,
        column: 'parse',
        message: error.message,
        value: error.code
      });
    });
  }

  // Validate headers
  const requiredHeaders = [
    'Month', 'Domestic_Medical_IP', 'Domestic_Medical_OP', 'Non_Domestic_Medical',
    'Prescription_Drugs', 'Dental', 'Vision', 'Mental_Health', 'Preventive_Care',
    'Emergency_Room', 'Urgent_Care', 'Specialty_Care', 'Lab_Diagnostic',
    'Physical_Therapy', 'DME', 'Home_Health', 'Enrollment'
  ];

  const actualHeaders = results.meta.fields || [];
  const missingHeaders = requiredHeaders.filter(header => !actualHeaders.includes(header));
  
  if (missingHeaders.length > 0) {
    errors.push({
      row: 0,
      column: 'headers',
      message: `Missing required columns: ${missingHeaders.join(', ')}`,
      value: missingHeaders
    });
  }

  // Process each row
  results.data.forEach((row: ParsedCSVRow, index: number) => {
    const rowNumber = index + 1;
    
    try {
      // First validate the raw CSV structure
      const csvValidation = validateExperienceDataCSV(row);
      if (!csvValidation.success) {
        csvValidation.error.errors.forEach(error => {
          errors.push({
            row: rowNumber,
            column: error.path.join('.'),
            message: error.message,
            value: row[error.path[0] as keyof ParsedCSVRow]
          });
        });
        return;
      }

      // Transform CSV strings to proper types
      const transformedData: ExperienceData = {
        id: `exp-${rowNumber}-${Date.now()}`,
        month: validateDateString(row.Month, 'Month'),
        domesticMedicalIP: validateNumericString(row.Domestic_Medical_IP, 'Domestic Medical IP'),
        domesticMedicalOP: validateNumericString(row.Domestic_Medical_OP, 'Domestic Medical OP'),
        nonDomesticMedical: validateNumericString(row.Non_Domestic_Medical, 'Non Domestic Medical'),
        prescriptionDrugs: validateNumericString(row.Prescription_Drugs, 'Prescription Drugs'),
        dental: validateNumericString(row.Dental, 'Dental'),
        vision: validateNumericString(row.Vision, 'Vision'),
        mentalHealth: validateNumericString(row.Mental_Health, 'Mental Health'),
        preventiveCare: validateNumericString(row.Preventive_Care, 'Preventive Care'),
        emergencyRoom: validateNumericString(row.Emergency_Room, 'Emergency Room'),
        urgentCare: validateNumericString(row.Urgent_Care, 'Urgent Care'),
        specialtyCare: validateNumericString(row.Specialty_Care, 'Specialty Care'),
        labDiagnostic: validateNumericString(row.Lab_Diagnostic, 'Lab Diagnostic'),
        physicalTherapy: validateNumericString(row.Physical_Therapy, 'Physical Therapy'),
        dme: validateNumericString(row.DME, 'DME'),
        homeHealth: validateNumericString(row.Home_Health, 'Home Health'),
        enrollment: validateNumericString(row.Enrollment, 'Enrollment')
      };

      validData.push(transformedData);
    } catch (error) {
      errors.push({
        row: rowNumber,
        column: 'validation',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        value: row
      });
    }
  });

  return {
    success: errors.length === 0,
    data: validData,
    errors,
    totalRows: results.data.length,
    validRows: validData.length,
    fileName
  };
}

/**
 * Process High Cost Claimant CSV parse results
 */
function processHighCostClaimantResults(
  results: Papa.ParseResult<ParsedCSVRow>,
  fileName: string
): CSVParseResult<HighCostClaimant> {
  const errors: CSVValidationError[] = [];
  const validData: HighCostClaimant[] = [];
  
  // Check for parsing errors
  if (results.errors.length > 0) {
    results.errors.forEach(error => {
      errors.push({
        row: error.row || 0,
        column: 'parse',
        message: error.message,
        value: error.code
      });
    });
  }

  // Validate headers
  const requiredHeaders = [
    'Member_ID', 'Age', 'Gender', 'Primary_Diagnosis_Code',
    'Primary_Diagnosis_Description', 'Total_Paid_Amount', 'Claim_Count',
    'Enrollment_Months', 'Risk_Score'
  ];

  const actualHeaders = results.meta.fields || [];
  const missingHeaders = requiredHeaders.filter(header => !actualHeaders.includes(header));
  
  if (missingHeaders.length > 0) {
    errors.push({
      row: 0,
      column: 'headers',
      message: `Missing required columns: ${missingHeaders.join(', ')}`,
      value: missingHeaders
    });
  }

  // Process each row
  results.data.forEach((row: ParsedCSVRow, index: number) => {
    const rowNumber = index + 1;
    
    try {
      // First validate the raw CSV structure
      const csvValidation = validateHighCostClaimantCSV(row);
      if (!csvValidation.success) {
        csvValidation.error.errors.forEach(error => {
          errors.push({
            row: rowNumber,
            column: error.path.join('.'),
            message: error.message,
            value: row[error.path[0] as keyof ParsedCSVRow]
          });
        });
        return;
      }

      // Transform CSV strings to proper types
      const transformedData: HighCostClaimant = {
        id: `hcc-${rowNumber}-${Date.now()}`,
        memberId: row.Member_ID.trim(),
        age: validateNumericString(row.Age, 'Age'),
        gender: validateGender(row.Gender),
        primaryDiagnosisCode: row.Primary_Diagnosis_Code.trim(),
        primaryDiagnosisDescription: row.Primary_Diagnosis_Description.trim(),
        totalPaidAmount: validateNumericString(row.Total_Paid_Amount, 'Total Paid Amount'),
        claimCount: validateNumericString(row.Claim_Count, 'Claim Count'),
        enrollmentMonths: validateNumericString(row.Enrollment_Months, 'Enrollment Months'),
        riskScore: validateNumericString(row.Risk_Score, 'Risk Score')
      };

      validData.push(transformedData);
    } catch (error) {
      errors.push({
        row: rowNumber,
        column: 'validation',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        value: row
      });
    }
  });

  return {
    success: errors.length === 0,
    data: validData,
    errors,
    totalRows: results.data.length,
    validRows: validData.length,
    fileName
  };
}

/**
 * Detect CSV file type based on headers
 */
export function detectCSVType(headers: string[]): 'experience' | 'high-cost-claimant' | 'unknown' {
  const experienceHeaders = ['Month', 'Domestic_Medical_IP', 'Enrollment'];
  const claimantHeaders = ['Member_ID', 'Age', 'Gender', 'Primary_Diagnosis_Code'];
  
  const hasExperienceHeaders = experienceHeaders.every(header => headers.includes(header));
  const hasClaimantHeaders = claimantHeaders.every(header => headers.includes(header));
  
  if (hasExperienceHeaders) return 'experience';
  if (hasClaimantHeaders) return 'high-cost-claimant';
  return 'unknown';
}

/**
 * Generate sample CSV data for templates
 */
export function generateExperienceDataTemplate(): string {
  const headers = [
    'Month', 'Domestic_Medical_IP', 'Domestic_Medical_OP', 'Non_Domestic_Medical',
    'Prescription_Drugs', 'Dental', 'Vision', 'Mental_Health', 'Preventive_Care',
    'Emergency_Room', 'Urgent_Care', 'Specialty_Care', 'Lab_Diagnostic',
    'Physical_Therapy', 'DME', 'Home_Health', 'Enrollment'
  ];
  
  const sampleData = [
    ['2024-01', '125000', '89000', '15000', '45000', '12000', '3500', '18000', '8500', '25000', '12000', '35000', '15000', '8000', '5000', '7500', '1200'],
    ['2024-02', '132000', '92000', '18000', '47000', '11500', '3200', '19500', '9000', '28000', '13500', '38000', '16500', '8500', '5500', '8000', '1195']
  ];
  
  return [headers, ...sampleData].map(row => row.join(',')).join('\n');
}

export function generateHighCostClaimantTemplate(): string {
  const headers = [
    'Member_ID', 'Age', 'Gender', 'Primary_Diagnosis_Code',
    'Primary_Diagnosis_Description', 'Total_Paid_Amount', 'Claim_Count',
    'Enrollment_Months', 'Risk_Score'
  ];
  
  const sampleData = [
    ['M001', '45', 'M', 'E11.9', 'Type 2 diabetes mellitus without complications', '125000', '24', '12', '2.8'],
    ['M002', '67', 'F', 'I25.10', 'Atherosclerotic heart disease of native coronary artery', '89000', '18', '12', '3.2']
  ];
  
  return [headers, ...sampleData].map(row => row.join(',')).join('\n');
}
