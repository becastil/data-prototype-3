/**
 * Stop Loss Fees API Route
 * Manages ISL and ASL fees by enrollment tier
 *
 * GET /api/inputs/stop-loss-fees - Fetch all stop loss fees
 * POST /api/inputs/stop-loss-fees - Create new stop loss fee
 * PUT /api/inputs/stop-loss-fees - Update existing stop loss fee
 * DELETE /api/inputs/stop-loss-fees - Delete stop loss fee
 */

import { NextRequest, NextResponse } from 'next/server';

// Simplified StopLossFeeByTier type for this API route
interface StopLossFeeByTier {
  id: string;
  feeType: 'ISL' | 'ASL';
  tier: 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY';
  amountPerMember: number;
  effectiveDate: string;
}

// In production: Replace with database operations
const mockStopLossFees: StopLossFeeByTier[] = [
  // Default Golden Sample ISL fees
  { id: 'sl-1', feeType: 'ISL', tier: 'EMPLOYEE_ONLY', amountPerMember: 35.00, effectiveDate: '2024-07-01' },
  { id: 'sl-2', feeType: 'ISL', tier: 'EMPLOYEE_SPOUSE', amountPerMember: 65.00, effectiveDate: '2024-07-01' },
  { id: 'sl-3', feeType: 'ISL', tier: 'EMPLOYEE_CHILDREN', amountPerMember: 65.00, effectiveDate: '2024-07-01' },
  { id: 'sl-4', feeType: 'ISL', tier: 'FAMILY', amountPerMember: 65.00, effectiveDate: '2024-07-01' },
  // Default ASL fees (if configured)
  { id: 'sl-5', feeType: 'ASL', tier: 'EMPLOYEE_ONLY', amountPerMember: 12.00, effectiveDate: '2024-07-01' },
  { id: 'sl-6', feeType: 'ASL', tier: 'EMPLOYEE_SPOUSE', amountPerMember: 12.00, effectiveDate: '2024-07-01' },
  { id: 'sl-7', feeType: 'ASL', tier: 'EMPLOYEE_CHILDREN', amountPerMember: 12.00, effectiveDate: '2024-07-01' },
  { id: 'sl-8', feeType: 'ASL', tier: 'FAMILY', amountPerMember: 12.00, effectiveDate: '2024-07-01' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feeType = searchParams.get('feeType'); // ISL or ASL
    const tier = searchParams.get('tier');

    let filtered = mockStopLossFees;

    if (feeType) {
      filtered = filtered.filter(fee => fee.feeType === feeType);
    }

    if (tier) {
      filtered = filtered.filter(fee => fee.tier === tier);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      metadata: {
        total: filtered.length,
        filters: { feeType, tier },
      },
    });

  } catch (error) {
    console.error('Stop Loss Fees GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stop loss fees', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.feeType || !body.tier || body.amountPerMember === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: feeType, tier, amountPerMember' },
        { status: 400 }
      );
    }

    // Validate feeType
    if (!['ISL', 'ASL'].includes(body.feeType)) {
      return NextResponse.json(
        { error: 'Invalid feeType. Must be ISL or ASL' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const exists = mockStopLossFees.find(
      fee => fee.feeType === body.feeType && fee.tier === body.tier && fee.effectiveDate === body.effectiveDate
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Stop loss fee already exists for this type/tier/date combination' },
        { status: 409 }
      );
    }

    const newFee: StopLossFeeByTier = {
      id: `sl-${Date.now()}`,
      feeType: body.feeType,
      tier: body.tier,
      amountPerMember: parseFloat(body.amountPerMember),
      effectiveDate: body.effectiveDate || new Date().toISOString().split('T')[0],
    };

    // In production: await db.stopLossFees.create({ data: newFee })
    mockStopLossFees.push(newFee);

    return NextResponse.json({
      success: true,
      data: newFee,
      message: 'Stop loss fee created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Stop Loss Fees POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create stop loss fee', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const index = mockStopLossFees.findIndex(fee => fee.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Stop loss fee not found' },
        { status: 404 }
      );
    }

    // Update fields
    const updated: StopLossFeeByTier = {
      ...mockStopLossFees[index],
      ...(body.feeType && { feeType: body.feeType }),
      ...(body.tier && { tier: body.tier }),
      ...(body.amountPerMember !== undefined && { amountPerMember: parseFloat(body.amountPerMember) }),
      ...(body.effectiveDate && { effectiveDate: body.effectiveDate }),
    };

    // In production: await db.stopLossFees.update({ where: { id: body.id }, data: updated })
    mockStopLossFees[index] = updated;

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Stop loss fee updated successfully',
    });

  } catch (error) {
    console.error('Stop Loss Fees PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update stop loss fee', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const index = mockStopLossFees.findIndex(fee => fee.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Stop loss fee not found' },
        { status: 404 }
      );
    }

    // In production: await db.stopLossFees.delete({ where: { id } })
    const deleted = mockStopLossFees.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Stop loss fee deleted successfully',
    });

  } catch (error) {
    console.error('Stop Loss Fees DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete stop loss fee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
