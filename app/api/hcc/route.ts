/**
 * High Cost Claimants (HCC) API Route
 * GET /api/hcc
 *
 * Returns high cost claimant data with filtering and summary statistics
 * Matches template page 4 (High Cost Claimant Module)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { HighClaimant } from '@/types/enterprise-template';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const planYearId = searchParams.get('planYearId');
    const planId = searchParams.get('planId') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const threshold = parseInt(searchParams.get('threshold') || '0', 10);

    // Validate required params
    if (!clientId || !planYearId) {
      return NextResponse.json(
        { error: 'Missing required parameters: clientId, planYearId' },
        { status: 400 }
      );
    }

    // In production: Fetch from database
    // const claimants = await db.highClaimants.findMany({
    //   where: {
    //     clientId,
    //     planYearId,
    //     ...(planId !== 'ALL' && { planId }),
    //     ...(status !== 'ALL' && { status }),
    //     totalPaid: { gte: threshold }
    //   },
    //   orderBy: { totalPaid: 'desc' }
    // });

    // For now: Use mock Golden Sample data
    const mockClaimants = generateMockHCCData(planYearId);

    // Apply filters
    let filteredClaimants = mockClaimants;

    if (planId !== 'ALL') {
      filteredClaimants = filteredClaimants.filter(c => c.planId === planId);
    }

    if (status !== 'ALL') {
      filteredClaimants = filteredClaimants.filter(c => c.status === status);
    }

    if (threshold > 0) {
      filteredClaimants = filteredClaimants.filter(c => c.totalPaid >= threshold);
    }

    // Calculate summary statistics
    const summary = calculateHCCSummary(filteredClaimants, 200000); // ISL Limit = $200k

    return NextResponse.json({
      success: true,
      data: {
        claimants: filteredClaimants,
        summary,
        metadata: {
          clientId,
          planYearId,
          planId,
          status,
          threshold,
          totalClaimants: filteredClaimants.length,
          generatedAt: new Date().toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('HCC API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch high cost claimants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate mock HCC data (Golden Sample - 8 claimants)
function generateMockHCCData(planYearId: string): HighClaimant[] {
  return [
    {
      id: 'hcc-001',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M001',
      planId: 'plan-ppo-base',
      status: 'ACTIVE' as const,
      primaryDiagnosis: 'Cancer',
      medicalPaid: 285000,
      rxPaid: 35000,
      totalPaid: 320000,
      islLimit: 200000,
      amountExceedingISL: 120000,
      recognized: true,
    },
    {
      id: 'hcc-002',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M002',
      planId: 'plan-ppo-buyup',
      status: 'ACTIVE' as const,
      primaryDiagnosis: 'Transplant',
      medicalPaid: 250000,
      rxPaid: 30000,
      totalPaid: 280000,
      islLimit: 200000,
      amountExceedingISL: 80000,
      recognized: true,
    },
    {
      id: 'hcc-003',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M003',
      planId: 'plan-ppo-base',
      status: 'TERMINATED' as const,
      primaryDiagnosis: 'Cardiac',
      medicalPaid: 210000,
      rxPaid: 28000,
      totalPaid: 238000,
      islLimit: 200000,
      amountExceedingISL: 38000,
      recognized: true,
    },
    {
      id: 'hcc-004',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M004',
      planId: 'plan-ppo-buyup',
      status: 'ACTIVE' as const,
      primaryDiagnosis: 'Neurological',
      medicalPaid: 190000,
      rxPaid: 22000,
      totalPaid: 212000,
      islLimit: 200000,
      amountExceedingISL: 12000,
      recognized: true,
    },
    {
      id: 'hcc-005',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M005',
      planId: 'plan-ppo-base',
      status: 'ACTIVE' as const,
      primaryDiagnosis: 'Maternity - High Risk',
      medicalPaid: 175000,
      rxPaid: 20000,
      totalPaid: 195000,
      islLimit: 200000,
      amountExceedingISL: 0,
      recognized: false,
    },
    {
      id: 'hcc-006',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M006',
      planId: 'plan-hdhp',
      status: 'COBRA' as const,
      primaryDiagnosis: 'Orthopedic Surgery',
      medicalPaid: 155000,
      rxPaid: 20000,
      totalPaid: 175000,
      islLimit: 200000,
      amountExceedingISL: 0,
      recognized: false,
    },
    {
      id: 'hcc-007',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M007',
      planId: 'plan-ppo-base',
      status: 'ACTIVE' as const,
      primaryDiagnosis: 'Chronic Kidney Disease',
      medicalPaid: 110000,
      rxPaid: 20000,
      totalPaid: 130000,
      islLimit: 200000,
      amountExceedingISL: 0,
      recognized: false,
    },
    {
      id: 'hcc-008',
      clientId: 'flavio-dog-house',
      planYearId,
      claimantKey: 'M008',
      planId: 'plan-ppo-buyup',
      status: 'ACTIVE' as const,
      primaryDiagnosis: 'Autoimmune',
      medicalPaid: 100000,
      rxPaid: 18000,
      totalPaid: 118000,
      islLimit: 200000,
      amountExceedingISL: 0,
      recognized: false,
    },
  ];
}

// Helper function to calculate HCC summary statistics
function calculateHCCSummary(claimants: HighClaimant[], islLimit: number) {
  const totalClaimants = claimants.length;
  const claimantsExceedingISL = claimants.filter(c => c.amountExceedingISL > 0).length;

  const totalMedicalClaims = claimants.reduce((sum, c) => sum + c.medicalPaid, 0);
  const totalPharmacyClaims = claimants.reduce((sum, c) => sum + c.rxPaid, 0);
  const totalPaid = claimants.reduce((sum, c) => sum + c.totalPaid, 0);

  // Calculate responsibilities
  const employerResponsibility = claimants.reduce((sum, c) => sum + Math.min(c.totalPaid, c.islLimit), 0);
  const stopLossResponsibility = claimants.reduce((sum, c) => sum + c.amountExceedingISL, 0);

  const averageCostPerClaimant = totalClaimants > 0 ? totalPaid / totalClaimants : 0;

  // Distribution by status
  const statusDistribution = {
    ACTIVE: claimants.filter(c => c.status === 'ACTIVE').length,
    TERMINATED: claimants.filter(c => c.status === 'TERMINATED').length,
    COBRA: claimants.filter(c => c.status === 'COBRA').length,
  };

  // Top diagnosis categories
  const diagnosisCounts = claimants.reduce((acc, c) => {
    acc[c.primaryDiagnosis] = (acc[c.primaryDiagnosis] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDiagnoses = Object.entries(diagnosisCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / totalClaimants) * 100,
    }));

  return {
    totalClaimants,
    claimantsExceedingISL,
    totalMedicalClaims,
    totalPharmacyClaims,
    totalPaid,
    employerResponsibility,
    stopLossResponsibility,
    averageCostPerClaimant,
    islLimit,
    statusDistribution,
    topDiagnoses,
  };
}
