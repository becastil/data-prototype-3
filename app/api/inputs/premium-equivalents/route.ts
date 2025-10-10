/**
 * Premium Equivalents API Route
 * Manages premium equivalent rates by plan and enrollment tier
 *
 * GET /api/inputs/premium-equivalents - Fetch all premium equivalents
 * POST /api/inputs/premium-equivalents - Create new premium equivalent
 * PUT /api/inputs/premium-equivalents - Update existing premium equivalent
 * DELETE /api/inputs/premium-equivalents - Delete premium equivalent
 */

import { NextRequest, NextResponse } from 'next/server';

// Simplified PremiumEquivalent type for this API route
interface PremiumEquivalent {
  id: string;
  planId: string;
  tier: 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY';
  amount: number;
  effectiveDate: string;
}

// In production: Replace with database operations
const mockPremiumEquivalents: PremiumEquivalent[] = [
  // Default Golden Sample data
  { id: 'pe-1', planId: 'plan-ppo-base', tier: 'EMPLOYEE_ONLY', amount: 654.32, effectiveDate: '2024-07-01' },
  { id: 'pe-2', planId: 'plan-ppo-base', tier: 'EMPLOYEE_SPOUSE', amount: 1308.64, effectiveDate: '2024-07-01' },
  { id: 'pe-3', planId: 'plan-ppo-base', tier: 'EMPLOYEE_CHILDREN', amount: 1177.78, effectiveDate: '2024-07-01' },
  { id: 'pe-4', planId: 'plan-ppo-base', tier: 'FAMILY', amount: 1962.96, effectiveDate: '2024-07-01' },
  { id: 'pe-5', planId: 'plan-ppo-buyup', tier: 'EMPLOYEE_ONLY', amount: 785.19, effectiveDate: '2024-07-01' },
  { id: 'pe-6', planId: 'plan-ppo-buyup', tier: 'EMPLOYEE_SPOUSE', amount: 1570.38, effectiveDate: '2024-07-01' },
  { id: 'pe-7', planId: 'plan-ppo-buyup', tier: 'EMPLOYEE_CHILDREN', amount: 1413.34, effectiveDate: '2024-07-01' },
  { id: 'pe-8', planId: 'plan-ppo-buyup', tier: 'FAMILY', amount: 2355.57, effectiveDate: '2024-07-01' },
  { id: 'pe-9', planId: 'plan-hdhp', tier: 'EMPLOYEE_ONLY', amount: 523.46, effectiveDate: '2024-07-01' },
  { id: 'pe-10', planId: 'plan-hdhp', tier: 'EMPLOYEE_SPOUSE', amount: 1046.92, effectiveDate: '2024-07-01' },
  { id: 'pe-11', planId: 'plan-hdhp', tier: 'EMPLOYEE_CHILDREN', amount: 942.23, effectiveDate: '2024-07-01' },
  { id: 'pe-12', planId: 'plan-hdhp', tier: 'FAMILY', amount: 1570.38, effectiveDate: '2024-07-01' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const tier = searchParams.get('tier');

    let filtered = mockPremiumEquivalents;

    if (planId) {
      filtered = filtered.filter(pe => pe.planId === planId);
    }

    if (tier) {
      filtered = filtered.filter(pe => pe.tier === tier);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      metadata: {
        total: filtered.length,
        filters: { planId, tier },
      },
    });

  } catch (error) {
    console.error('Premium Equivalents GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch premium equivalents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.planId || !body.tier || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, tier, amount' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const exists = mockPremiumEquivalents.find(
      pe => pe.planId === body.planId && pe.tier === body.tier && pe.effectiveDate === body.effectiveDate
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Premium equivalent already exists for this plan/tier/date combination' },
        { status: 409 }
      );
    }

    const newPE: PremiumEquivalent = {
      id: `pe-${Date.now()}`,
      planId: body.planId,
      tier: body.tier,
      amount: parseFloat(body.amount),
      effectiveDate: body.effectiveDate || new Date().toISOString().split('T')[0],
    };

    // In production: await db.premiumEquivalents.create({ data: newPE })
    mockPremiumEquivalents.push(newPE);

    return NextResponse.json({
      success: true,
      data: newPE,
      message: 'Premium equivalent created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Premium Equivalents POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create premium equivalent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const index = mockPremiumEquivalents.findIndex(pe => pe.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Premium equivalent not found' },
        { status: 404 }
      );
    }

    // Update fields
    const updated: PremiumEquivalent = {
      ...mockPremiumEquivalents[index],
      ...(body.planId && { planId: body.planId }),
      ...(body.tier && { tier: body.tier }),
      ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
      ...(body.effectiveDate && { effectiveDate: body.effectiveDate }),
    };

    // In production: await db.premiumEquivalents.update({ where: { id: body.id }, data: updated })
    mockPremiumEquivalents[index] = updated;

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Premium equivalent updated successfully',
    });

  } catch (error) {
    console.error('Premium Equivalents PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update premium equivalent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const index = mockPremiumEquivalents.findIndex(pe => pe.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Premium equivalent not found' },
        { status: 404 }
      );
    }

    // In production: await db.premiumEquivalents.delete({ where: { id } })
    const deleted = mockPremiumEquivalents.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Premium equivalent deleted successfully',
    });

  } catch (error) {
    console.error('Premium Equivalents DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete premium equivalent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
