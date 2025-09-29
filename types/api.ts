// API request and response types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// CSV Upload API
export interface UploadFileRequest {
  file: File;
  type: 'experience-data' | 'high-cost-claimants';
  options?: {
    skipHeaderValidation?: boolean;
    delimiter?: string;
    encoding?: string;
  };
}

export interface UploadFileResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  validationErrors: ValidationError[];
  warnings: ValidationWarning[];
  preview: Record<string, any>[];
}

export interface ValidationError {
  row: number;
  column: string;
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  row: number;
  column: string;
  value: any;
  message: string;
  suggestion?: string;
}

// Calculations API
export interface CalculateLossRatioRequest {
  experienceData: Array<{
    month: string;
    claims: number;
    fees: number;
    premiums: number;
  }>;
  options?: {
    targetLossRatio?: number;
    rollingPeriods?: number;
  };
}

export interface CalculateLossRatioResponse {
  monthlyCalculations: Array<{
    month: string;
    lossRatio: number;
    variance: number;
    status: 'good' | 'warning' | 'critical';
  }>;
  rollingCalculations: Array<{
    endMonth: string;
    period: number;
    lossRatio: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  summary: {
    averageLossRatio: number;
    bestMonth: string;
    worstMonth: string;
    volatility: number;
  };
}

export interface CalculatePMPMRequest {
  experienceData: Array<{
    month: string;
    totalCost: number;
    memberMonths: number;
  }>;
  categories?: string[];
}

export interface CalculatePMPMResponse {
  monthlyPMPM: Array<{
    month: string;
    pmpm: number;
    memberMonths: number;
    totalCost: number;
  }>;
  categoryPMPM: Array<{
    category: string;
    pmpm: number;
    percentage: number;
  }>;
  trends: {
    overallTrend: number; // percentage change
    categoryTrends: Array<{
      category: string;
      trend: number;
    }>;
  };
}

// Dashboard API
export interface GetDashboardDataRequest {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    categories?: string[];
    memberSegments?: string[];
    costThreshold?: {
      min: number;
      max: number;
    };
  };
}

export interface GetDashboardDataResponse {
  kpis: {
    totalClaims: number;
    totalCost: number;
    avgLossRatio: number;
    avgClaim: number;
    totalMembers: number;
    avgPMPM: number;
  };
  monthlyTrends: Array<{
    month: string;
    claims: number;
    fees: number;
    lossRatio: number;
    enrollment: number;
    pmpm: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topDiagnoses: Array<{
    code: string;
    description: string;
    totalCost: number;
    claimCount: number;
    memberCount: number;
  }>;
  highCostMembers: Array<{
    memberId: string;
    totalCost: number;
    riskScore: number;
    primaryDiagnosis: string;
  }>;
  performanceMetrics: Array<{
    name: string;
    value: number;
    target: number;
    variance: number;
    status: string;
  }>;
}

// Reports API
export interface GenerateReportRequest {
  type: 'executive-summary' | 'detailed-analysis' | 'loss-ratio' | 'pmpm-trend';
  format: 'pdf' | 'excel' | 'csv';
  config: {
    title: string;
    subtitle?: string;
    includeCharts: boolean;
    includeTables: boolean;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    orientation?: 'landscape' | 'portrait';
    filters?: Record<string, any>;
  };
}

export interface GenerateReportResponse {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}

export interface GetReportStatusRequest {
  reportId: string;
}

export interface GetReportStatusResponse {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  progress?: number;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
  generatedAt?: string;
}

// Fee Configuration API
export interface SaveFeeConfigurationRequest {
  configurations: Array<{
    id?: string;
    month: string;
    feeType: 'flat' | 'pepm' | 'pmpm' | 'tiered' | 'annual' | 'manual';
    amount: number;
    enrollment?: number;
    effectiveDate: string;
    description?: string;
  }>;
}

export interface SaveFeeConfigurationResponse {
  savedConfigurations: Array<{
    id: string;
    month: string;
    calculatedTotal: number;
  }>;
  validationErrors: ValidationError[];
}

// Health Check API
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    database: 'healthy' | 'unhealthy';
    storage: 'healthy' | 'unhealthy';
    cache: 'healthy' | 'unhealthy';
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

// User Management API (if needed)
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

// Export API
export interface ExportDataRequest {
  type: 'experience-data' | 'summary-table' | 'dashboard-data';
  format: 'csv' | 'excel' | 'json';
  filters?: Record<string, any>;
  options?: {
    includeHeaders?: boolean;
    dateFormat?: string;
    numberFormat?: string;
  };
}

export interface ExportDataResponse {
  exportId: string;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
}

// Audit API
export interface GetAuditLogRequest {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export type GetAuditLogResponse = PaginatedResponse<AuditLogEntry>;

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  stack?: string; // Only in development
}

// Request/Response middleware types
export interface RequestContext {
  requestId: string;
  userId?: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  processingTime: number;
  cacheHit?: boolean;
  version: string;
}