import { ExperienceData, HighCostClaimant, FeeStructure, MonthlySummary, DashboardKPIs, CategoryBreakdown, MonthlyTrendData, DiagnosisBreakdown } from '@/types/healthcare';
import { calculateMonthlyLossRatio, calculateRolling12LossRatio } from '@/lib/calculations/loss-ratio';
import { calculatePMPM } from '@/lib/calculations/pmpm';

/**
 * Transform experience data and fees into monthly summaries
 */
export function generateMonthlySummaries(
  experienceData: ExperienceData[],
  feeStructures: FeeStructure[],
  premiumData: Array<{ month: string; premiumAmount: number; enrollment: number }>,
  targetLossRatio: number = 0.85
): MonthlySummary[] {
  const summaries: MonthlySummary[] = [];
  
  // Sort data by month to ensure proper rolling calculations
  const sortedExperienceData = [...experienceData].sort((a, b) => a.month.localeCompare(b.month));
  const sortedFeeStructures = [...feeStructures].sort((a, b) => a.month.localeCompare(b.month));
  const sortedPremiumData = [...premiumData].sort((a, b) => a.month.localeCompare(b.month));
  
  sortedExperienceData.forEach((expData, index) => {
    // Calculate total claims for the month
    const claims = 
      expData.domesticMedicalIP +
      expData.domesticMedicalOP +
      expData.nonDomesticMedical +
      expData.prescriptionDrugs +
      expData.dental +
      expData.vision +
      expData.mentalHealth +
      expData.preventiveCare +
      expData.emergencyRoom +
      expData.urgentCare +
      expData.specialtyCare +
      expData.labDiagnostic +
      expData.physicalTherapy +
      expData.dme +
      expData.homeHealth;
    
    // Find corresponding fee data
    const feeData = sortedFeeStructures.find(fee => fee.month === expData.month);
    const fees = feeData?.calculatedTotal || 0;
    
    // Find corresponding premium data
    const premiumInfo = sortedPremiumData.find(premium => premium.month === expData.month);
    const premiums = premiumInfo?.premiumAmount || 0;
    
    // Calculate monthly loss ratio
    const monthlyLossRatio = premiums > 0 ? calculateMonthlyLossRatio(claims, fees, premiums) : 0;
    
    // Calculate rolling 12-month loss ratio
    const dataForRolling = sortedExperienceData
      .slice(Math.max(0, index - 11), index + 1)
      .map(item => {
        const itemFee = sortedFeeStructures.find(fee => fee.month === item.month);
        const itemPremium = sortedPremiumData.find(premium => premium.month === item.month);
        return {
          month: item.month,
          claims: calculateTotalClaims(item),
          fees: itemFee?.calculatedTotal || 0,
          premiums: itemPremium?.premiumAmount || 0
        };
      });
    
    const rolling12LossRatio = dataForRolling.length > 0 ? calculateRolling12LossRatio(dataForRolling) : 0;
    
    // Calculate variance from target
    const variance = targetLossRatio > 0 ? ((monthlyLossRatio - targetLossRatio) / targetLossRatio) * 100 : 0;
    
    // Calculate PMPM
    const memberMonths = expData.enrollment;
    const pmpm = memberMonths > 0 ? calculatePMPM(claims, memberMonths) : 0;
    
    const summary: MonthlySummary = {
      id: `summary-${expData.month}`,
      month: expData.month,
      claims,
      fees,
      premiums,
      totalCost: claims + fees,
      monthlyLossRatio,
      rolling12LossRatio,
      variance,
      memberMonths,
      pmpm
    };
    
    summaries.push(summary);
  });
  
  return summaries;
}

/**
 * Calculate total claims for an experience data record
 */
function calculateTotalClaims(expData: ExperienceData): number {
  return (
    expData.domesticMedicalIP +
    expData.domesticMedicalOP +
    expData.nonDomesticMedical +
    expData.prescriptionDrugs +
    expData.dental +
    expData.vision +
    expData.mentalHealth +
    expData.preventiveCare +
    expData.emergencyRoom +
    expData.urgentCare +
    expData.specialtyCare +
    expData.labDiagnostic +
    expData.physicalTherapy +
    expData.dme +
    expData.homeHealth
  );
}

/**
 * Generate dashboard KPIs from monthly summaries
 */
export function generateDashboardKPIs(monthlySummaries: MonthlySummary[]): DashboardKPIs {
  if (monthlySummaries.length === 0) {
    return {
      totalClaims: 0,
      totalCost: 0,
      avgLossRatio: 0,
      avgClaim: 0,
      totalMembers: 0,
      avgPMPM: 0
    };
  }
  
  const totalClaims = monthlySummaries.reduce((sum, month) => sum + month.claims, 0);
  const totalCost = monthlySummaries.reduce((sum, month) => sum + month.totalCost, 0);
  const totalMemberMonths = monthlySummaries.reduce((sum, month) => sum + month.memberMonths, 0);
  
  // Calculate average loss ratio (weighted by premiums)
  const weightedLossRatioSum = monthlySummaries.reduce((sum, month) => 
    sum + (month.monthlyLossRatio * month.premiums), 0);
  const totalPremiums = monthlySummaries.reduce((sum, month) => sum + month.premiums, 0);
  const avgLossRatio = totalPremiums > 0 ? weightedLossRatioSum / totalPremiums : 0;
  
  // Calculate average claim (total claims / total member months)
  const avgClaim = totalMemberMonths > 0 ? totalClaims / totalMemberMonths : 0;
  
  // Calculate average PMPM
  const avgPMPM = monthlySummaries.reduce((sum, month) => sum + month.pmpm, 0) / monthlySummaries.length;
  
  // Estimate unique members (approximate based on average enrollment)
  const avgEnrollment = totalMemberMonths / monthlySummaries.length;
  
  return {
    totalClaims,
    totalCost,
    avgLossRatio,
    avgClaim,
    totalMembers: Math.round(avgEnrollment),
    avgPMPM
  };
}

/**
 * Generate category breakdown from experience data
 */
export function generateCategoryBreakdown(experienceData: ExperienceData[]): CategoryBreakdown[] {
  if (experienceData.length === 0) return [];
  
  // Aggregate all categories across all months
  const totals = experienceData.reduce((acc, data) => {
    acc.domesticMedicalIP += data.domesticMedicalIP;
    acc.domesticMedicalOP += data.domesticMedicalOP;
    acc.nonDomesticMedical += data.nonDomesticMedical;
    acc.prescriptionDrugs += data.prescriptionDrugs;
    acc.dental += data.dental;
    acc.vision += data.vision;
    acc.mentalHealth += data.mentalHealth;
    acc.preventiveCare += data.preventiveCare;
    acc.emergencyRoom += data.emergencyRoom;
    acc.urgentCare += data.urgentCare;
    acc.specialtyCare += data.specialtyCare;
    acc.labDiagnostic += data.labDiagnostic;
    acc.physicalTherapy += data.physicalTherapy;
    acc.dme += data.dme;
    acc.homeHealth += data.homeHealth;
    return acc;
  }, {
    domesticMedicalIP: 0,
    domesticMedicalOP: 0,
    nonDomesticMedical: 0,
    prescriptionDrugs: 0,
    dental: 0,
    vision: 0,
    mentalHealth: 0,
    preventiveCare: 0,
    emergencyRoom: 0,
    urgentCare: 0,
    specialtyCare: 0,
    labDiagnostic: 0,
    physicalTherapy: 0,
    dme: 0,
    homeHealth: 0
  });
  
  const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);
  
  if (grandTotal === 0) return [];
  
  const categories: CategoryBreakdown[] = [
    { category: 'Domestic Medical IP', amount: totals.domesticMedicalIP, percentage: (totals.domesticMedicalIP / grandTotal) * 100, color: '#1976d2' },
    { category: 'Domestic Medical OP', amount: totals.domesticMedicalOP, percentage: (totals.domesticMedicalOP / grandTotal) * 100, color: '#2e7d32' },
    { category: 'Prescription Drugs', amount: totals.prescriptionDrugs, percentage: (totals.prescriptionDrugs / grandTotal) * 100, color: '#ed6c02' },
    { category: 'Emergency Room', amount: totals.emergencyRoom, percentage: (totals.emergencyRoom / grandTotal) * 100, color: '#d32f2f' },
    { category: 'Specialty Care', amount: totals.specialtyCare, percentage: (totals.specialtyCare / grandTotal) * 100, color: '#7b1fa2' },
    { category: 'Mental Health', amount: totals.mentalHealth, percentage: (totals.mentalHealth / grandTotal) * 100, color: '#c2185b' },
    { category: 'Lab Diagnostic', amount: totals.labDiagnostic, percentage: (totals.labDiagnostic / grandTotal) * 100, color: '#388e3c' },
    { category: 'Urgent Care', amount: totals.urgentCare, percentage: (totals.urgentCare / grandTotal) * 100, color: '#f57c00' },
    { category: 'Dental', amount: totals.dental, percentage: (totals.dental / grandTotal) * 100, color: '#5e35b1' },
    { category: 'Physical Therapy', amount: totals.physicalTherapy, percentage: (totals.physicalTherapy / grandTotal) * 100, color: '#00796b' },
    { category: 'Preventive Care', amount: totals.preventiveCare, percentage: (totals.preventiveCare / grandTotal) * 100, color: '#0288d1' },
    { category: 'Home Health', amount: totals.homeHealth, percentage: (totals.homeHealth / grandTotal) * 100, color: '#689f38' },
    { category: 'DME', amount: totals.dme, percentage: (totals.dme / grandTotal) * 100, color: '#af4c4c' },
    { category: 'Vision', amount: totals.vision, percentage: (totals.vision / grandTotal) * 100, color: '#5d4037' },
    { category: 'Non-Domestic Medical', amount: totals.nonDomesticMedical, percentage: (totals.nonDomesticMedical / grandTotal) * 100, color: '#455a64' }
  ];
  
  // Sort by amount descending and filter out zero amounts
  return categories
    .filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Generate monthly trend data for charts
 */
export function generateMonthlyTrendData(
  experienceData: ExperienceData[],
  feeStructures: FeeStructure[],
  monthlySummaries: MonthlySummary[]
): MonthlyTrendData[] {
  const sortedData = [...experienceData].sort((a, b) => a.month.localeCompare(b.month));
  
  return sortedData.map(data => {
    const summary = monthlySummaries.find(s => s.month === data.month);
    const feeData = feeStructures.find(f => f.month === data.month);
    
    return {
      month: data.month,
      claims: summary?.claims || 0,
      fees: feeData?.calculatedTotal || 0,
      lossRatio: summary?.monthlyLossRatio || 0,
      enrollment: data.enrollment,
      pmpm: summary?.pmpm || 0
    };
  });
}

/**
 * Generate diagnosis breakdown from high-cost claimants
 */
export function generateDiagnosisBreakdown(highCostClaimants: HighCostClaimant[]): DiagnosisBreakdown[] {
  if (highCostClaimants.length === 0) return [];
  
  const diagnosisMap = new Map<string, {
    code: string;
    description: string;
    totalCost: number;
    claimCount: number;
    memberCount: number;
  }>();
  
  highCostClaimants.forEach(claimant => {
    const key = claimant.primaryDiagnosisCode;
    const existing = diagnosisMap.get(key);
    
    if (existing) {
      existing.totalCost += claimant.totalPaidAmount;
      existing.claimCount += claimant.claimCount;
      existing.memberCount += 1;
    } else {
      diagnosisMap.set(key, {
        code: claimant.primaryDiagnosisCode,
        description: claimant.primaryDiagnosisDescription,
        totalCost: claimant.totalPaidAmount,
        claimCount: claimant.claimCount,
        memberCount: 1
      });
    }
  });
  
  const breakdown: DiagnosisBreakdown[] = Array.from(diagnosisMap.values()).map(item => ({
    diagnosisCode: item.code,
    diagnosisDescription: item.description,
    totalCost: item.totalCost,
    claimCount: item.claimCount,
    memberCount: item.memberCount,
    avgCostPerClaim: item.claimCount > 0 ? item.totalCost / item.claimCount : 0
  }));
  
  // Sort by total cost descending
  return breakdown.sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Generate premium data from fee structures and enrollment
 */
export function generatePremiumData(
  experienceData: ExperienceData[],
  feeStructures: FeeStructure[],
  premiumRate: number = 500 // Default PMPM premium rate
): Array<{ month: string; premiumAmount: number; enrollment: number }> {
  return experienceData.map(expData => {
    const feeData = feeStructures.find(fee => fee.month === expData.month);
    
    // Calculate premium as a percentage above total costs to achieve target loss ratio
    const totalClaims = calculateTotalClaims(expData);
    const totalFees = feeData?.calculatedTotal || 0;
    const totalCosts = totalClaims + totalFees;
    
    // Use either calculated premium based on target loss ratio or default rate
    const premiumAmount = Math.max(
      totalCosts / 0.85, // Assuming 85% target loss ratio
      premiumRate * expData.enrollment // Minimum premium based on rate
    );
    
    return {
      month: expData.month,
      premiumAmount,
      enrollment: expData.enrollment
    };
  });
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; header: string }>
): string {
  if (data.length === 0) return '';
  
  const keys = columns ? columns.map(col => col.key) : Object.keys(data[0]) as Array<keyof T>;
  const headers = columns ? columns.map(col => col.header) : keys.map(String);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

/**
 * Format numbers for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}