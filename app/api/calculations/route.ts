import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { ExperienceData, FeeStructure, MonthlySummary } from '@/types/healthcare';
import { 
  generateMonthlySummaries, 
  generateDashboardKPIs, 
  generateCategoryBreakdown, 
  generateMonthlyTrendData,
  generateDiagnosisBreakdown,
  generatePremiumData
} from '@/lib/utils/dataTransform';
import { 
  calculateMonthlyLossRatio, 
  calculateRolling12LossRatio,
  generateLossRatioSummary,
  predictLossRatio,
  calculateLossRatioImpact
} from '@/lib/calculations/loss-ratio';
import { calculatePMPM, calculatePEPM } from '@/lib/calculations/pmpm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    switch (type) {
      case 'monthly-summaries':
        return handleMonthlySummaries(body.data);
      
      case 'dashboard-kpis':
        return handleDashboardKPIs(body.data);
      
      case 'category-breakdown':
        return handleCategoryBreakdown(body.data);
      
      case 'trend-data':
        return handleTrendData(body.data);
      
      case 'diagnosis-breakdown':
        return handleDiagnosisBreakdown(body.data);
      
      case 'loss-ratio-summary':
        return handleLossRatioSummary(body.data);
      
      case 'loss-ratio-prediction':
        return handleLossRatioPrediction(body.data);
      
      case 'loss-ratio-impact':
        return handleLossRatioImpact(body.data);
      
      case 'pmpm-calculation':
        return handlePMPMCalculation(body.data);
      
      case 'premium-generation':
        return handlePremiumGeneration(body.data);
      
      case 'dashboard-analytics':
        return handleDashboardAnalytics(body.data);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid calculation type'
        } as ApiResponse<null>, { status: 400 });
    }
    
  } catch (error) {
    console.error('Calculations API error:', error);
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as ApiResponse<null>, { status: 500 });
  }
}

async function handleMonthlySummaries(data: {
  experienceData: ExperienceData[];
  feeStructures: FeeStructure[];
  premiumData?: Array<{ month: string; premiumAmount: number; enrollment: number }>;
  targetLossRatio?: number;
}) {
  try {
    const { experienceData, feeStructures, premiumData, targetLossRatio = 0.85 } = data;
    
    if (!experienceData || !Array.isArray(experienceData)) {
      throw new Error('Experience data is required and must be an array');
    }
    
    if (!feeStructures || !Array.isArray(feeStructures)) {
      throw new Error('Fee structures are required and must be an array');
    }
    
    // Generate premium data if not provided
    const premiums = premiumData || generatePremiumData(experienceData, feeStructures);
    
    const summaries = generateMonthlySummaries(
      experienceData,
      feeStructures,
      premiums,
      targetLossRatio
    );
    
    return NextResponse.json({
      success: true,
      data: summaries,
      message: `Generated ${summaries.length} monthly summaries`
    } as ApiResponse<MonthlySummary[]>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in monthly summaries calculation'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleDashboardKPIs(data: { monthlySummaries: MonthlySummary[] }) {
  try {
    const { monthlySummaries } = data;
    
    if (!monthlySummaries || !Array.isArray(monthlySummaries)) {
      throw new Error('Monthly summaries are required and must be an array');
    }
    
    const kpis = generateDashboardKPIs(monthlySummaries);
    
    return NextResponse.json({
      success: true,
      data: kpis,
      message: 'KPIs calculated successfully'
    } as ApiResponse<typeof kpis>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in KPI calculation'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleCategoryBreakdown(data: { experienceData: ExperienceData[] }) {
  try {
    const { experienceData } = data;
    
    if (!experienceData || !Array.isArray(experienceData)) {
      throw new Error('Experience data is required and must be an array');
    }
    
    const breakdown = generateCategoryBreakdown(experienceData);
    
    return NextResponse.json({
      success: true,
      data: breakdown,
      message: `Generated breakdown for ${breakdown.length} categories`
    } as ApiResponse<typeof breakdown>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in category breakdown'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleTrendData(data: {
  experienceData: ExperienceData[];
  feeStructures: FeeStructure[];
  monthlySummaries: MonthlySummary[];
}) {
  try {
    const { experienceData, feeStructures, monthlySummaries } = data;
    
    if (!experienceData || !Array.isArray(experienceData)) {
      throw new Error('Experience data is required');
    }
    
    if (!feeStructures || !Array.isArray(feeStructures)) {
      throw new Error('Fee structures are required');
    }
    
    if (!monthlySummaries || !Array.isArray(monthlySummaries)) {
      throw new Error('Monthly summaries are required');
    }
    
    const trendData = generateMonthlyTrendData(experienceData, feeStructures, monthlySummaries);
    
    return NextResponse.json({
      success: true,
      data: trendData,
      message: `Generated trend data for ${trendData.length} months`
    } as ApiResponse<typeof trendData>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in trend data generation'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleDiagnosisBreakdown(data: { highCostClaimants: any[] }) {
  try {
    const { highCostClaimants } = data;
    
    if (!highCostClaimants || !Array.isArray(highCostClaimants)) {
      throw new Error('High cost claimants data is required and must be an array');
    }
    
    const breakdown = generateDiagnosisBreakdown(highCostClaimants);
    
    return NextResponse.json({
      success: true,
      data: breakdown,
      message: `Generated diagnosis breakdown for ${breakdown.length} diagnoses`
    } as ApiResponse<typeof breakdown>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in diagnosis breakdown'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleLossRatioSummary(data: {
  monthlyData: Array<{ month: string; claims: number; fees: number; premiums: number }>;
  targetLossRatio?: number;
}) {
  try {
    const { monthlyData, targetLossRatio = 0.85 } = data;
    
    if (!monthlyData || !Array.isArray(monthlyData)) {
      throw new Error('Monthly data is required and must be an array');
    }
    
    const summary = generateLossRatioSummary(monthlyData, targetLossRatio);
    
    return NextResponse.json({
      success: true,
      data: summary,
      message: 'Loss ratio summary calculated successfully'
    } as ApiResponse<typeof summary>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in loss ratio summary'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleLossRatioPrediction(data: {
  monthlyData: Array<{ month: string; claims: number; fees: number; premiums: number }>;
  monthsToPredict?: number;
}) {
  try {
    const { monthlyData, monthsToPredict = 3 } = data;
    
    if (!monthlyData || !Array.isArray(monthlyData)) {
      throw new Error('Monthly data is required and must be an array');
    }
    
    const predictions = predictLossRatio(monthlyData, monthsToPredict);
    
    return NextResponse.json({
      success: true,
      data: predictions,
      message: `Generated predictions for ${predictions.length} months`
    } as ApiResponse<typeof predictions>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in loss ratio prediction'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleLossRatioImpact(data: {
  currentData: { claims: number; fees: number; premiums: number };
  changes: {
    claimsChange?: number;
    feesChange?: number;
    premiumsChange?: number;
  };
}) {
  try {
    const { currentData, changes } = data;
    
    if (!currentData) {
      throw new Error('Current data is required');
    }
    
    if (!changes) {
      throw new Error('Changes data is required');
    }
    
    const impact = calculateLossRatioImpact(currentData, changes);
    
    return NextResponse.json({
      success: true,
      data: impact,
      message: 'Loss ratio impact calculated successfully'
    } as ApiResponse<typeof impact>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in loss ratio impact calculation'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handlePMPMCalculation(data: {
  totalCost: number;
  memberMonths: number;
  employees?: number;
}) {
  try {
    const { totalCost, memberMonths, employees } = data;
    
    if (typeof totalCost !== 'number' || typeof memberMonths !== 'number') {
      throw new Error('Total cost and member months are required and must be numbers');
    }
    
    const pmpm = calculatePMPM(totalCost, memberMonths);
    let pepm = null;
    
    if (employees && typeof employees === 'number') {
      pepm = calculatePEPM(totalCost, employees);
    }
    
    return NextResponse.json({
      success: true,
      data: { pmpm, pepm },
      message: 'PMPM/PEPM calculated successfully'
    } as ApiResponse<{ pmpm: number; pepm: number | null }>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in PMPM calculation'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handlePremiumGeneration(data: {
  experienceData: ExperienceData[];
  feeStructures: FeeStructure[];
  premiumRate?: number;
}) {
  try {
    const { experienceData, feeStructures, premiumRate = 500 } = data;
    
    if (!experienceData || !Array.isArray(experienceData)) {
      throw new Error('Experience data is required');
    }
    
    if (!feeStructures || !Array.isArray(feeStructures)) {
      throw new Error('Fee structures are required');
    }
    
    const premiumData = generatePremiumData(experienceData, feeStructures, premiumRate);
    
    return NextResponse.json({
      success: true,
      data: premiumData,
      message: `Generated premium data for ${premiumData.length} months`
    } as ApiResponse<typeof premiumData>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in premium generation'
    } as ApiResponse<null>, { status: 400 });
  }
}

async function handleDashboardAnalytics(data: {
  experienceData: ExperienceData[];
  feeStructures: FeeStructure[];
  monthlySummaries: MonthlySummary[];
  highCostClaimants?: any[];
}) {
  try {
    const { experienceData, feeStructures, monthlySummaries, highCostClaimants = [] } = data;
    
    if (!monthlySummaries || !Array.isArray(monthlySummaries)) {
      throw new Error('Monthly summaries are required');
    }

    // Generate KPIs from monthly summaries
    const kpis = generateDashboardKPIs(monthlySummaries);
    
    // Generate monthly trend data
    const monthlyData = generateMonthlyTrendData(monthlySummaries);
    
    // Generate category breakdown from experience data
    const categoryBreakdown = experienceData.length > 0 
      ? generateCategoryBreakdown(experienceData)
      : [];
    
    // Generate diagnosis breakdown from experience data if available
    const topDiagnoses = experienceData.length > 0 
      ? generateDiagnosisBreakdown(experienceData)
      : [];
    
    // Generate high-cost members analysis
    const highCostMembers = highCostClaimants.slice(0, 5).map(member => ({
      memberId: member.memberId || member.id || 'Unknown',
      totalCost: member.totalPaidAmount || member.totalCost || 0,
      riskScore: member.riskScore || 2.5,
      primaryDiagnosis: member.primaryDiagnosisDescription || member.primaryDiagnosis || 'Not specified'
    }));

    const dashboardData = {
      kpis: {
        totalClaims: kpis.totalClaims,
        totalCost: kpis.totalCost,
        avgLossRatio: kpis.avgLossRatio,
        avgClaim: kpis.avgClaim || 0,
        totalMembers: kpis.totalMembers || 0,
        avgPMPM: kpis.avgPMPM
      },
      monthlyData,
      categoryBreakdown,
      topDiagnoses,
      highCostMembers
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard analytics generated successfully'
    } as ApiResponse<typeof dashboardData>);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in dashboard analytics generation'
    } as ApiResponse<null>, { status: 400 });
  }
}