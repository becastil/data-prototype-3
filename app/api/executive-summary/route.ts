/**
 * Executive Summary API Route
 * GET /api/executive-summary
 *
 * Returns Executive Dashboard KPIs, Fuel Gauge data, and distribution insights
 * Matches template page 2
 */

import { NextRequest, NextResponse } from 'next/server';
import type { DistributionInsights } from '@/types/enterprise-template';
import {
  calculateExecutiveSummaryKPIs,
  calculateFuelGauge,
  calculateMedicalVsRxDistribution,
  calculatePlanMixDistribution,
  calculateHighClaimantBuckets
} from '@/lib/calculations/template-formulas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const planYearId = searchParams.get('planYearId');
    const through = searchParams.get('through'); // YYYY-MM format

    // Validate required params
    if (!clientId || !planYearId) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, planYearId' },
        { status: 400 }
      );
    }

    // In production: Fetch from database
    // const monthlyStats = await db.monthlyPlanStats.findMany({
    //   where: { clientId, planYearId, planId: 'ALL_PLANS' },
    //   orderBy: { monthSnapshotId: 'asc' }
    // });

    // For now: Use mock Golden Sample data
    const mockMonthlyStats = generateMockMonthlyStats(clientId, planYearId, through);
    const mockPlanYear = {
      id: planYearId,
      clientId,
      yearLabel: '2024 Plan Year',
      startDate: '2024-07-01',
      endDate: '2025-06-30',
      islLimit: 200000,
      hccThreshold: 100000,
      budgetPEPM: 988.79,
      active: true,
    };

    // Calculate Executive Summary KPIs
    const kpis = calculateExecutiveSummaryKPIs(
      mockMonthlyStats,
      mockPlanYear,
      through || '2025-06'
    );

    // Calculate Fuel Gauge
    const fuelGauge = calculateFuelGauge(kpis.percentOfBudget);

    // Calculate Distribution Insights
    const medicalVsRx = calculateMedicalVsRxDistribution(
      kpis.medicalPaidClaims,
      kpis.pharmacyPaidClaims
    );

    const mockPlans = [
      { planId: 'plan-ppo-base', planName: 'PPO Base', medicalClaims: 2500000, pharmacyClaims: 500000 },
      { planId: 'plan-ppo-buyup', planName: 'PPO Buy-Up', medicalClaims: 1700000, pharmacyClaims: 300000 },
      { planId: 'plan-hdhp', planName: 'HDHP', medicalClaims: 220000, pharmacyClaims: 48182 },
    ];
    const planMix = calculatePlanMixDistribution(mockPlans);

    const mockHighClaimants = [
      { id: 'hcc-1', clientId, planYearId, claimantKey: 'M001', planId: 'plan-ppo-base', status: 'ACTIVE' as const, primaryDiagnosis: 'Cancer', medicalPaid: 285000, rxPaid: 35000, totalPaid: 320000, amountExceedingISL: 120000, islLimit: 200000, recognized: true, dataThrough: through || '2025-06' },
      { id: 'hcc-2', clientId, planYearId, claimantKey: 'M002', planId: 'plan-ppo-buyup', status: 'ACTIVE' as const, primaryDiagnosis: 'Transplant', medicalPaid: 250000, rxPaid: 30000, totalPaid: 280000, amountExceedingISL: 80000, islLimit: 200000, recognized: true, dataThrough: through || '2025-06' },
      { id: 'hcc-3', clientId, planYearId, claimantKey: 'M003', planId: 'plan-ppo-base', status: 'TERMINATED' as const, primaryDiagnosis: 'Cardiac', medicalPaid: 210000, rxPaid: 28000, totalPaid: 238000, amountExceedingISL: 38000, islLimit: 200000, recognized: true, dataThrough: through || '2025-06' },
      { id: 'hcc-4', clientId, planYearId, claimantKey: 'M004', planId: 'plan-ppo-buyup', status: 'ACTIVE' as const, primaryDiagnosis: 'Neurological', medicalPaid: 190000, rxPaid: 22000, totalPaid: 212000, amountExceedingISL: 12000, islLimit: 200000, recognized: true, dataThrough: through || '2025-06' },
      { id: 'hcc-5', clientId, planYearId, claimantKey: 'M005', planId: 'plan-ppo-base', status: 'ACTIVE' as const, primaryDiagnosis: 'Maternity', medicalPaid: 175000, rxPaid: 20000, totalPaid: 195000, amountExceedingISL: 0, islLimit: 200000, recognized: false, dataThrough: through || '2025-06' },
      { id: 'hcc-6', clientId, planYearId, claimantKey: 'M006', planId: 'plan-hdhp', status: 'COBRA' as const, primaryDiagnosis: 'Orthopedic', medicalPaid: 155000, rxPaid: 20000, totalPaid: 175000, amountExceedingISL: 0, islLimit: 200000, recognized: false, dataThrough: through || '2025-06' },
      { id: 'hcc-7', clientId, planYearId, claimantKey: 'M007', planId: 'plan-ppo-base', status: 'ACTIVE' as const, primaryDiagnosis: 'Chronic Kidney', medicalPaid: 110000, rxPaid: 20000, totalPaid: 130000, amountExceedingISL: 0, islLimit: 200000, recognized: false, dataThrough: through || '2025-06' },
      { id: 'hcc-8', clientId, planYearId, claimantKey: 'M008', planId: 'plan-ppo-buyup', status: 'ACTIVE' as const, primaryDiagnosis: 'Autoimmune', medicalPaid: 100000, rxPaid: 18000, totalPaid: 118000, amountExceedingISL: 0, islLimit: 200000, recognized: false, dataThrough: through || '2025-06' },
    ];
    const totalPaidClaims = mockHighClaimants.reduce((sum, hcc) => sum + hcc.totalPaid, 0);
    const highClaimantBuckets = calculateHighClaimantBuckets(
      mockHighClaimants,
      totalPaidClaims
    );

    const distributionInsights: DistributionInsights = {
      medicalVsRx,
      planMix,
      highCostBuckets: highClaimantBuckets,
    };

    // Return complete executive summary payload
    return NextResponse.json({
      success: true,
      data: {
        kpis,
        fuelGauge,
        distributionInsights,
        metadata: {
          clientId,
          planYearId,
          dataThrough: through || '2025-06',
          generatedAt: new Date().toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('Executive Summary API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate executive summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate mock data (will be replaced with DB queries)
function generateMockMonthlyStats(_clientId: string, _planYearId: string, _through?: string | null) {
  // Golden Sample data for Flavio's Dog House
  const mockData = [
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
  ];

  return mockData.map((row, index) => ({
    id: `stat-${index + 1}`,
    monthSnapshotId: `m${index + 1}`,
    planId: 'ALL_PLANS',
    ...row,
    grossMedicalPharmacyClaims: row.medicalClaims + row.pharmacyClaims,
    netMedicalPharmacyClaims: row.medicalClaims + row.pharmacyClaims + row.specStopLossReimb + row.estimatedRxRebates,
    totalPlanCost: (row.medicalClaims + row.pharmacyClaims + row.specStopLossReimb + row.estimatedRxRebates + row.adminFees + row.stopLossFees),
    surplusDeficit: row.budgetedPremium - (row.medicalClaims + row.pharmacyClaims + row.specStopLossReimb + row.estimatedRxRebates + row.adminFees + row.stopLossFees),
    percentOfBudget: ((row.medicalClaims + row.pharmacyClaims + row.specStopLossReimb + row.estimatedRxRebates + row.adminFees + row.stopLossFees) / row.budgetedPremium) * 100,
    enrollmentByTier: {
      EMPLOYEE_ONLY: Math.round(row.totalSubscribers * 0.45),
      EMPLOYEE_SPOUSE: Math.round(row.totalSubscribers * 0.30),
      EMPLOYEE_CHILDREN: Math.round(row.totalSubscribers * 0.15),
      FAMILY: Math.round(row.totalSubscribers * 0.10),
    },
  }));
}
