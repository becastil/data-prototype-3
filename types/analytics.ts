// Analytics and dashboard-specific types

export interface AnalyticsFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  categories: string[];
  memberSegments: string[];
  diagnosisCodes: string[];
  providers: string[];
  costThreshold: {
    min: number;
    max: number;
  };
}

export interface TrendAnalysis {
  period: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  forecast?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  variance: number;
  status: 'on-track' | 'at-risk' | 'off-track';
  trend: TrendAnalysis[];
  unit: string;
  format: 'currency' | 'percentage' | 'number';
}

export interface DashboardTile {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'metric';
  title: string;
  subtitle?: string;
  size: 'small' | 'medium' | 'large';
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
  data: any;
  config: Record<string, any>;
  refreshInterval?: number;
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'combo';
  title: string;
  subtitle?: string;
  xAxis: {
    label: string;
    dataKey: string;
    format?: string;
  };
  yAxis: {
    label: string;
    dataKey: string | string[];
    format: 'currency' | 'percentage' | 'number';
    min?: number;
    max?: number;
  };
  series: ChartSeries[];
  legend: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  colors: string[];
  annotations?: ChartAnnotation[];
}

export interface ChartSeries {
  name: string;
  dataKey: string;
  type?: 'line' | 'bar' | 'area';
  color: string;
  yAxisId?: 'left' | 'right';
  visible: boolean;
}

export interface ChartAnnotation {
  type: 'line' | 'area' | 'point';
  value: number | number[];
  label: string;
  color: string;
}

export interface DrillDownConfig {
  enabled: boolean;
  levels: DrillDownLevel[];
  currentLevel: number;
  breadcrumb: string[];
}

export interface DrillDownLevel {
  name: string;
  groupBy: string;
  filters: Record<string, any>;
  chartConfig: ChartConfiguration;
}

export interface ComparisonAnalysis {
  baselineValue: number;
  comparisonValue: number;
  difference: number;
  percentChange: number;
  significance: 'high' | 'medium' | 'low';
  direction: 'improvement' | 'degradation' | 'neutral';
}

export interface CohortAnalysis {
  cohortId: string;
  cohortName: string;
  definition: Record<string, any>;
  size: number;
  metrics: PerformanceMetric[];
  timeSeriesData: TimeSeriesData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface SegmentationAnalysis {
  segments: MemberSegment[];
  criteria: SegmentationCriteria;
  performance: SegmentPerformance[];
}

export interface MemberSegment {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  criteria: Record<string, any>;
  color: string;
}

export interface SegmentationCriteria {
  demographic: string[];
  clinical: string[];
  utilization: string[];
  cost: string[];
}

export interface SegmentPerformance {
  segmentId: string;
  metrics: {
    totalCost: number;
    pmpm: number;
    lossRatio: number;
    utilizationRate: number;
    riskScore: number;
  };
  trends: TrendAnalysis[];
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'cost-prediction' | 'risk-stratification' | 'utilization-forecast';
  algorithm: string;
  accuracy: number;
  lastTrained: string;
  features: string[];
  predictions: ModelPrediction[];
}

export interface ModelPrediction {
  entityId: string;
  entityType: 'member' | 'group' | 'category';
  predictedValue: number;
  confidence: number;
  factors: PredictionFactor[];
  timeHorizon: string;
}

export interface PredictionFactor {
  name: string;
  impact: number;
  direction: 'positive' | 'negative';
  confidence: number;
}

export interface BenchmarkComparison {
  metric: string;
  actualValue: number;
  benchmarkValue: number;
  percentile: number;
  industry: string;
  region: string;
  planType: string;
  source: string;
  asOfDate: string;
}

export interface OutlierDetection {
  entityId: string;
  entityType: 'member' | 'provider' | 'diagnosis' | 'category';
  metric: string;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
  zScore: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface RootCauseAnalysis {
  issue: string;
  primaryCauses: Cause[];
  contributingFactors: Factor[];
  recommendations: Recommendation[];
  impactAssessment: ImpactAssessment;
}

export interface Cause {
  category: string;
  description: string;
  likelihood: number;
  impact: number;
  evidence: string[];
}

export interface Factor {
  name: string;
  contribution: number;
  description: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeline: string;
  owner: string;
  status: 'proposed' | 'approved' | 'in-progress' | 'completed';
}

export interface ImpactAssessment {
  financial: {
    currentCost: number;
    projectedSavings: number;
    roi: number;
  };
  operational: {
    effortRequired: string;
    resourcesNeeded: string[];
    timeToImplement: string;
  };
  clinical: {
    qualityImpact: string;
    memberExperience: string;
    riskMitigation: string;
  };
}

export interface AlertConfig {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'percentage_change';
  threshold: number;
  frequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  enabled: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  configId: string;
  triggeredAt: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  actions: AlertAction[];
}

export interface AlertAction {
  id: string;
  type: 'notification' | 'email' | 'webhook' | 'escalation';
  status: 'pending' | 'completed' | 'failed';
  executedAt?: string;
  details: Record<string, any>;
}