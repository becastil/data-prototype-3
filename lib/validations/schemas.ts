import { z } from 'zod';
import { ExperienceData, HighCostClaimant } from '@/types/healthcare';

// Base validation schemas for healthcare data

export const ExperienceDataSchema = z.object({
  id: z.string(),
  month: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
    .refine((val) => {
      const [year, month] = val.split('-').map(Number);
      return year >= 2020 && year <= 2030 && month >= 1 && month <= 12;
    }, 'Invalid month/year'),
  domesticMedicalIP: z.number().min(0, 'Domestic Medical IP must be non-negative'),
  domesticMedicalOP: z.number().min(0, 'Domestic Medical OP must be non-negative'),
  nonDomesticMedical: z.number().min(0, 'Non-Domestic Medical must be non-negative'),
  prescriptionDrugs: z.number().min(0, 'Prescription Drugs must be non-negative'),
  dental: z.number().min(0, 'Dental must be non-negative'),
  vision: z.number().min(0, 'Vision must be non-negative'),
  mentalHealth: z.number().min(0, 'Mental Health must be non-negative'),
  preventiveCare: z.number().min(0, 'Preventive Care must be non-negative'),
  emergencyRoom: z.number().min(0, 'Emergency Room must be non-negative'),
  urgentCare: z.number().min(0, 'Urgent Care must be non-negative'),
  specialtyCare: z.number().min(0, 'Specialty Care must be non-negative'),
  labDiagnostic: z.number().min(0, 'Lab Diagnostic must be non-negative'),
  physicalTherapy: z.number().min(0, 'Physical Therapy must be non-negative'),
  dme: z.number().min(0, 'DME must be non-negative'),
  homeHealth: z.number().min(0, 'Home Health must be non-negative'),
  enrollment: z.number().min(1, 'Enrollment must be at least 1')
});

export const HighCostClaimantSchema = z.object({
  id: z.string(),
  memberId: z.string().min(1, 'Member ID is required'),
  age: z.number().min(0).max(150, 'Age must be between 0 and 150'),
  gender: z.enum(['M', 'F'], { 
    errorMap: () => ({ message: 'Gender must be M or F' })
  }),
  primaryDiagnosisCode: z.string()
    .min(3, 'Diagnosis code must be at least 3 characters')
    .max(10, 'Diagnosis code must be at most 10 characters'),
  primaryDiagnosisDescription: z.string()
    .min(5, 'Diagnosis description must be at least 5 characters')
    .max(200, 'Diagnosis description must be at most 200 characters'),
  totalPaidAmount: z.number().min(0, 'Total paid amount must be non-negative'),
  claimCount: z.number().min(1, 'Claim count must be at least 1'),
  enrollmentMonths: z.number().min(1).max(12, 'Enrollment months must be between 1 and 12'),
  riskScore: z.number().min(0).max(10, 'Risk score must be between 0 and 10')
});

export const FeeStructureSchema = z.object({
  month: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  feeType: z.enum(['flat', 'pepm', 'pmpm', 'tiered', 'annual', 'manual'], {
    errorMap: () => ({ message: 'Invalid fee type' })
  }),
  amount: z.number().min(0, 'Amount must be non-negative'),
  enrollment: z.number().min(0).optional(),
  effectiveDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective date must be in YYYY-MM-DD format'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional()
}).refine((data) => {
  // PMPM and PEPM fee types require enrollment
  if ((data.feeType === 'pmpm' || data.feeType === 'pepm') && !data.enrollment) {
    return false;
  }
  return true;
}, {
  message: 'Enrollment is required for PMPM and PEPM fee types',
  path: ['enrollment']
});

export const PremiumDataSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  premiumAmount: z.number().min(0, 'Premium amount must be non-negative'),
  enrollment: z.number().min(1, 'Enrollment must be at least 1'),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective date must be in YYYY-MM-DD format')
});

export const DashboardConfigSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(100, 'Client name too long'),
  planYear: z.string()
    .regex(/^\d{4}$/, 'Plan year must be 4 digits')
    .refine((val) => {
      const year = parseInt(val);
      return year >= 2020 && year <= 2030;
    }, 'Plan year must be between 2020 and 2030'),
  reportingPeriod: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
  }).refine((data) => {
    return new Date(data.startDate) < new Date(data.endDate);
  }, {
    message: 'End date must be after start date',
    path: ['endDate']
  }),
  targetLossRatio: z.number().min(0.1).max(2.0, 'Target loss ratio must be between 0.1 and 2.0'),
  currency: z.enum(['USD', 'CAD', 'EUR'], {
    errorMap: () => ({ message: 'Invalid currency' })
  }),
  dateFormat: z.string().min(1, 'Date format is required')
});

// CSV-specific validation schemas with string inputs that will be transformed
export const ExperienceDataCSVSchema = z.object({
  Month: z.string().min(1, 'Month is required'),
  Domestic_Medical_IP: z.string().min(1, 'Domestic Medical IP is required'),
  Domestic_Medical_OP: z.string().min(1, 'Domestic Medical OP is required'),
  Non_Domestic_Medical: z.string().min(1, 'Non Domestic Medical is required'),
  Prescription_Drugs: z.string().min(1, 'Prescription Drugs is required'),
  Dental: z.string().min(1, 'Dental is required'),
  Vision: z.string().min(1, 'Vision is required'),
  Mental_Health: z.string().min(1, 'Mental Health is required'),
  Preventive_Care: z.string().min(1, 'Preventive Care is required'),
  Emergency_Room: z.string().min(1, 'Emergency Room is required'),
  Urgent_Care: z.string().min(1, 'Urgent Care is required'),
  Specialty_Care: z.string().min(1, 'Specialty Care is required'),
  Lab_Diagnostic: z.string().min(1, 'Lab Diagnostic is required'),
  Physical_Therapy: z.string().min(1, 'Physical Therapy is required'),
  DME: z.string().min(1, 'DME is required'),
  Home_Health: z.string().min(1, 'Home Health is required'),
  Enrollment: z.string().min(1, 'Enrollment is required')
});

export const HighCostClaimantCSVSchema = z.object({
  Member_ID: z.string().min(1, 'Member ID is required'),
  Age: z.string().min(1, 'Age is required'),
  Gender: z.string().min(1, 'Gender is required'),
  Primary_Diagnosis_Code: z.string().min(1, 'Primary Diagnosis Code is required'),
  Primary_Diagnosis_Description: z.string().min(1, 'Primary Diagnosis Description is required'),
  Total_Paid_Amount: z.string().min(1, 'Total Paid Amount is required'),
  Claim_Count: z.string().min(1, 'Claim Count is required'),
  Enrollment_Months: z.string().min(1, 'Enrollment Months is required'),
  Risk_Score: z.string().min(1, 'Risk Score is required')
});

// Utility functions for validation
export function validateExperienceData(data: unknown) {
  return ExperienceDataSchema.safeParse(data);
}

export function validateHighCostClaimant(data: unknown) {
  return HighCostClaimantSchema.safeParse(data);
}

export function validateFeeStructure(data: unknown) {
  return FeeStructureSchema.safeParse(data);
}

export function validateDashboardConfig(data: unknown) {
  return DashboardConfigSchema.safeParse(data);
}

// CSV validation functions
export function validateExperienceDataCSV(data: unknown) {
  return ExperienceDataCSVSchema.safeParse(data);
}

export function validateHighCostClaimantCSV(data: unknown) {
  return HighCostClaimantCSVSchema.safeParse(data);
}

// Custom validation helpers
export function validateNumericString(value: string, fieldName: string): number {
  const parsed = parseFloat(value.replace(/,/g, ''));
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a valid non-negative number`);
  }
  return parsed;
}

export function validateDateString(value: string, fieldName: string): string {
  const monthRegex = /^\d{4}-\d{2}$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!monthRegex.test(value) && !dateRegex.test(value)) {
    throw new Error(`${fieldName} must be in YYYY-MM or YYYY-MM-DD format`);
  }
  
  return value;
}

export function validateGender(value: string): 'M' | 'F' {
  const upperValue = value.toUpperCase();
  if (upperValue !== 'M' && upperValue !== 'F') {
    throw new Error('Gender must be M or F');
  }
  return upperValue as 'M' | 'F';
}

// Batch validation for arrays
export function validateExperienceDataArray(data: unknown[]): {
  validData: ExperienceData[];
  errors: Array<{ row: number; errors: string[] }>;
} {
  const validData: ExperienceData[] = [];
  const errors: Array<{ row: number; errors: string[] }> = [];

  data.forEach((item, index) => {
    const result = validateExperienceData(item);
    if (result.success) {
      validData.push(result.data);
    } else {
      errors.push({
        row: index + 1,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      });
    }
  });

  return { validData, errors };
}

export function validateHighCostClaimantArray(data: unknown[]): {
  validData: HighCostClaimant[];
  errors: Array<{ row: number; errors: string[] }>;
} {
  const validData: HighCostClaimant[] = [];
  const errors: Array<{ row: number; errors: string[] }> = [];

  data.forEach((item, index) => {
    const result = validateHighCostClaimant(item);
    if (result.success) {
      validData.push(result.data);
    } else {
      errors.push({
        row: index + 1,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      });
    }
  });

  return { validData, errors };
}
