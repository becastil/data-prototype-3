// Healthcare data types based on the specification

export interface ExperienceData {
  id: string;
  month: string;
  domesticMedicalIP: number;
  domesticMedicalOP: number;
  nonDomesticMedical: number;
  prescriptionDrugs: number;
  dental: number;
  vision: number;
  mentalHealth: number;
  preventiveCare: number;
  emergencyRoom: number;
  urgentCare: number;
  specialtyCare: number;
  labDiagnostic: number;
  physicalTherapy: number;
  dme: number; // Durable Medical Equipment
  homeHealth: number;
  enrollment: number;
}

export interface HighCostClaimant {
  id: string;
  memberId: string;
  age: number;
  gender: 'M' | 'F';
  primaryDiagnosisCode: string;
  primaryDiagnosisDescription: string;
  totalPaidAmount: number;
  claimCount: number;
  enrollmentMonths: number;
  riskScore: number;
}

export interface FeeStructure {
  id: string;
  month: string;
  feeType: 'flat' | 'pepm' | 'pmpm' | 'tiered' | 'annual' | 'manual';
  amount: number;
  enrollment?: number;
  calculatedTotal: number;
  effectiveDate: string;
  description?: string;
}

export interface MonthlySummary {
  id: string;
  month: string;
  claims: number;
  fees: number;
  premiums: number;
  totalCost: number; // claims + fees
  monthlyLossRatio: number; // (claims + fees) / premiums
  rolling12LossRatio: number;
  variance: number; // percentage variance from target
  memberMonths: number;
  pmpm: number; // per member per month
}

export interface DashboardKPIs {
  totalClaims: number;
  totalCost: number;
  avgLossRatio: number;
  avgClaim: number;
  totalMembers: number;
  avgPMPM: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface MonthlyTrendData {
  month: string;
  claims: number;
  fees: number;
  lossRatio: number;
  enrollment: number;
  pmpm: number;
}

export interface DiagnosisBreakdown {
  diagnosisCode: string;
  diagnosisDescription: string;
  totalCost: number;
  claimCount: number;
  memberCount: number;
  avgCostPerClaim: number;
}

// CSV Upload types
export interface CSVUploadResult {
  success: boolean;
  data?: ExperienceData[] | HighCostClaimant[];
  errors?: string[];
  fileName: string;
  rowCount?: number;
}

export interface CSVValidationError {
  row: number;
  column: string;
  message: string;
  value: unknown;
}

// Calculation result types
export interface LossRatioCalculation {
  monthly: number;
  rolling12: number;
  target: number;
  variance: number;
  status: 'good' | 'warning' | 'critical';
}

export interface PMPMCalculation {
  medical: number;
  pharmacy: number;
  total: number;
  trend: number; // percentage change from previous period
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard configuration
export interface DashboardConfig {
  clientName: string;
  planYear: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  targetLossRatio: number;
  currency: string;
  dateFormat: string;
}

// PDF Export configuration
export interface PDFExportConfig {
  orientation: 'landscape' | 'portrait';
  includeCharts: boolean;
  includeSummaryTable: boolean;
  includeKPIs: boolean;
  title: string;
  subtitle?: string;
  footer?: string;
}

// Form validation schemas (for use with Zod)
export interface FormErrors {
  [key: string]: string;
}

// State management types
export interface AppState {
  experienceData: ExperienceData[];
  highCostClaimants: HighCostClaimant[];
  feeStructures: FeeStructure[];
  monthlySummaries: MonthlySummary[];
  dashboardConfig: DashboardConfig;
  loading: boolean;
  error: string | null;
}

// Navigation types
export interface NavigationStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  path: string;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface PieChartData {
  labels: string[];
  data: number[];
  backgroundColor: string[];
  borderColor?: string[];
}

// File upload types
export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark';
  dateFormat: string;
  numberFormat: string;
  defaultCurrency: string;
  autoSave: boolean;
  notifications: boolean;
}

// Audit trail
export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
}
