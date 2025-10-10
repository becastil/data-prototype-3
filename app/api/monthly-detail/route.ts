/**
 * Monthly Detail API Route
 * GET /api/monthly-detail
 *
 * Returns monthly plan statistics with columns A-N calculations
 * Supports filtering by plan (All Plans, HDHP, PPO Base, PPO Buy-Up)
 * Matches template pages 3, 5-7
 */

import { NextRequest, NextResponse } from 'next/server';
import type { MonthlyPlanStats } from '@/types/enterprise-template';
import { calculateMonthlyStats, calculatePEPM } from '@/lib/calculations/template-formulas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const planYearId = searchParams.get('planYearId');
    const planId = searchParams.get('planId') || 'ALL_PLANS';
    const months = parseInt(searchParams.get('months') || '24', 10);

    // Validate required params
    if (!clientId || !planYearId) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, planYearId' },
        { status: 400 }
      );
    }

    // In production: Fetch from database
    // const monthlyStats = await db.monthlyPlanStats.findMany({
    //   where: { clientId, planYearId, planId },
    //   orderBy: { monthSnapshotId: 'asc' },
    //   take: months
    // });

    // For now: Use mock data
    const rawData = generateMockMonthlyData(planId, months);

    // Calculate complete stats for each month (columns A-N)
    const calculatedData: MonthlyPlanStats[] = rawData.map(row => calculateMonthlyStats(row));

    // Calculate PEPM for different periods
    const priorPYData = calculatedData.slice(0, 12);
    const currentPYData = calculatedData.slice(12, 24);
    const current12Data = calculatedData.slice(-12);
    const prior12Data = calculatedData.slice(0, 12);

    const pepmCalculations = {
      currentPY: currentPYData.length > 0 ? calculatePEPM(currentPYData, 'Current PY') : null,
      priorPY: priorPYData.length > 0 ? calculatePEPM(priorPYData, 'Prior PY') : null,
      current12: current12Data.length > 0 ? calculatePEPM(current12Data, 'Current 12') : null,
      prior12: prior12Data.length > 0 ? calculatePEPM(prior12Data, 'Prior 12') : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        monthlyStats: calculatedData,
        pepmCalculations,
        metadata: {
          clientId,
          planYearId,
          planId,
          months: calculatedData.length,
          generatedAt: new Date().toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('Monthly Detail API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch monthly detail',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate mock data based on plan
function generateMockMonthlyData(planId: string, months: number) {
  // Base "All Plans" data
  const allPlansData = [
    // Prior PY (Jul 2023 - Jun 2024)
    { totalSubscribers: 449, medicalClaims: 150727, pharmacyClaims: 30212, specStopLossReimb: 0, estimatedRxRebates: -33675, adminFees: 19904, stopLossFees: 55218, budgetedPremium: 382709 },
    { totalSubscribers: 448, medicalClaims: 88827, pharmacyClaims: 31059, specStopLossReimb: 0, estimatedRxRebates: -33600, adminFees: 19860, stopLossFees: 55134, budgetedPremium: 382142 },
    { totalSubscribers: 444, medicalClaims: 413648, pharmacyClaims: 48424, specStopLossReimb: 0, estimatedRxRebates: -33300, adminFees: 19683, stopLossFees: 55143, budgetedPremium: 382314 },
    { totalSubscribers: 446, medicalClaims: 247666, pharmacyClaims: 30880, specStopLossReimb: 0, estimatedRxRebates: -33450, adminFees: 19771, stopLossFees: 55310, budgetedPremium: 383377 },
    { totalSubscribers: 449, medicalClaims: 466867, pharmacyClaims: 40030, specStopLossReimb: 0, estimatedRxRebates: -33675, adminFees: 19904, stopLossFees: 55908, budgetedPremium: 387444 },
    { totalSubscribers: 455, medicalClaims: 190769, pharmacyClaims: 35543, specStopLossReimb: 0, estimatedRxRebates: -34125, adminFees: 20170, stopLossFees: 56739, budgetedPremium: 393727 },
    { totalSubscribers: 453, medicalClaims: 421311, pharmacyClaims: 56671, specStopLossReimb: 0, estimatedRxRebates: -33975, adminFees: 20081, stopLossFees: 56808, budgetedPremium: 394626 },
    { totalSubscribers: 446, medicalClaims: 309247, pharmacyClaims: 47683, specStopLossReimb: 0, estimatedRxRebates: -33450, adminFees: 19771, stopLossFees: 56038, budgetedPremium: 389539 },
    { totalSubscribers: 445, medicalClaims: 299012, pharmacyClaims: 51426, specStopLossReimb: 0, estimatedRxRebates: -33375, adminFees: 19727, stopLossFees: 55753, budgetedPremium: 387107 },
    { totalSubscribers: 454, medicalClaims: 192188, pharmacyClaims: 53262, specStopLossReimb: 0, estimatedRxRebates: -34050, adminFees: 20126, stopLossFees: 56561, budgetedPremium: 392306 },
    { totalSubscribers: 453, medicalClaims: 782742, pharmacyClaims: 48369, specStopLossReimb: 0, estimatedRxRebates: -33975, adminFees: 20081, stopLossFees: 56310, budgetedPremium: 390357 },
    { totalSubscribers: 442, medicalClaims: 523731, pharmacyClaims: 45825, specStopLossReimb: 0, estimatedRxRebates: -33150, adminFees: 19594, stopLossFees: 55245, budgetedPremium: 383284 },
    // Current PY (Jul 2024 - Jun 2025)
    { totalSubscribers: 483, medicalClaims: 261827, pharmacyClaims: 59708, specStopLossReimb: 0, estimatedRxRebates: -36225, adminFees: 22136, stopLossFees: 69101, budgetedPremium: 471493 },
    { totalSubscribers: 481, medicalClaims: 173841, pharmacyClaims: 49520, specStopLossReimb: 0, estimatedRxRebates: -36075, adminFees: 22044, stopLossFees: 69079, budgetedPremium: 471930 },
    { totalSubscribers: 479, medicalClaims: 339246, pharmacyClaims: 47644, specStopLossReimb: 0, estimatedRxRebates: -35925, adminFees: 21953, stopLossFees: 68687, budgetedPremium: 468778 },
    { totalSubscribers: 477, medicalClaims: 319071, pharmacyClaims: 64891, specStopLossReimb: 0, estimatedRxRebates: -35775, adminFees: 21861, stopLossFees: 68360, budgetedPremium: 466259 },
    { totalSubscribers: 476, medicalClaims: 712326, pharmacyClaims: 58257, specStopLossReimb: -397928, estimatedRxRebates: -35700, adminFees: 21815, stopLossFees: 68629, budgetedPremium: 468545 },
    { totalSubscribers: 469, medicalClaims: 240732, pharmacyClaims: 61659, specStopLossReimb: -48535, estimatedRxRebates: -35175, adminFees: 21494, stopLossFees: 68121, budgetedPremium: 465632 },
    { totalSubscribers: 461, medicalClaims: 212771, pharmacyClaims: 58005, specStopLossReimb: -3572, estimatedRxRebates: -34575, adminFees: 21128, stopLossFees: 67258, budgetedPremium: 459615 },
    { totalSubscribers: 454, medicalClaims: 268914, pharmacyClaims: 49033, specStopLossReimb: -7756, estimatedRxRebates: -34050, adminFees: 20807, stopLossFees: 66466, budgetedPremium: 454291 },
    { totalSubscribers: 461, medicalClaims: 316992, pharmacyClaims: 55837, specStopLossReimb: -28284, estimatedRxRebates: -34575, adminFees: 21128, stopLossFees: 67556, budgetedPremium: 461685 },
    { totalSubscribers: 467, medicalClaims: 363614, pharmacyClaims: 59972, specStopLossReimb: -33654, estimatedRxRebates: -35025, adminFees: 21403, stopLossFees: 67755, budgetedPremium: 462164 },
    { totalSubscribers: 467, medicalClaims: 683702, pharmacyClaims: 55997, specStopLossReimb: -3214, estimatedRxRebates: -35025, adminFees: 21403, stopLossFees: 67973, budgetedPremium: 464244 },
    { totalSubscribers: 474, medicalClaims: 606934, pharmacyClaims: 57999, specStopLossReimb: -40568, estimatedRxRebates: -35550, adminFees: 21723, stopLossFees: 68998, budgetedPremium: 471015 },
  ];

  // Apply plan-specific distribution
  let distribution = 1.0; // Default for ALL_PLANS
  if (planId === 'plan-hdhp') distribution = 0.03;
  else if (planId === 'plan-ppo-base') distribution = 0.58;
  else if (planId === 'plan-ppo-buyup') distribution = 0.39;

  return allPlansData.slice(0, months).map((row, index) => ({
    id: `stat-${planId}-${index + 1}`,
    monthSnapshotId: `m${index + 1}`,
    planId,
    totalSubscribers: Math.round(row.totalSubscribers * distribution),
    medicalClaims: Math.round(row.medicalClaims * distribution),
    pharmacyClaims: Math.round(row.pharmacyClaims * distribution),
    specStopLossReimb: Math.round(row.specStopLossReimb * distribution),
    estimatedRxRebates: Math.round(row.estimatedRxRebates * distribution),
    adminFees: Math.round(row.adminFees * distribution),
    stopLossFees: Math.round(row.stopLossFees * distribution),
    budgetedPremium: Math.round(row.budgetedPremium * distribution),
  }));
}
