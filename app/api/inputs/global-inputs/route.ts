/**
 * Global Inputs API Route
 * Manages system-wide calculation parameters
 *
 * GET /api/inputs/global-inputs - Fetch all global inputs
 * POST /api/inputs/global-inputs - Create new global input
 * PUT /api/inputs/global-inputs - Update existing global input
 * DELETE /api/inputs/global-inputs - Delete global input
 */

import { NextRequest, NextResponse } from 'next/server';

// Simplified GlobalInput type for this API route
interface GlobalInput {
  id: string;
  name: string;
  value: number;
  type: 'currency' | 'percentage' | 'factor';
  description: string;
  effectiveDate: string;
}

// In production: Replace with database operations
const mockGlobalInputs: GlobalInput[] = [
  {
    id: 'gi-1',
    name: 'Rx Rebate PEPM',
    value: 75.00,
    type: 'currency',
    description: 'Estimated pharmacy rebate per employee per month (appears as negative in Column G)',
    effectiveDate: '2024-07-01',
  },
  {
    id: 'gi-2',
    name: 'IBNR Adjustment',
    value: 0,
    type: 'currency',
    description: 'Incurred But Not Reported claims adjustment for lag time',
    effectiveDate: '2024-07-01',
  },
  {
    id: 'gi-3',
    name: 'ASL Composite Factor',
    value: 47.00,
    type: 'currency',
    description: 'Aggregate Stop Loss composite rate PMPM (alternative to tiered ISL)',
    effectiveDate: '2024-07-01',
  },
  {
    id: 'gi-4',
    name: 'ISL Limit',
    value: 200000,
    type: 'currency',
    description: 'Individual Stop Loss attachment point per member per year',
    effectiveDate: '2024-07-01',
  },
  {
    id: 'gi-5',
    name: 'HCC Threshold',
    value: 100000,
    type: 'currency',
    description: 'High Cost Claimant threshold (typically 50% of ISL)',
    effectiveDate: '2024-07-01',
  },
  {
    id: 'gi-6',
    name: 'Expected Loss Ratio',
    value: 85,
    type: 'percentage',
    description: 'Target loss ratio for budget planning',
    effectiveDate: '2024-07-01',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const type = searchParams.get('type');

    let filtered = mockGlobalInputs;

    if (name) {
      filtered = filtered.filter(input => input.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (type) {
      filtered = filtered.filter(input => input.type === type);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      metadata: {
        total: filtered.length,
        filters: { name, type },
      },
    });

  } catch (error) {
    console.error('Global Inputs GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global inputs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || body.value === undefined || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value, type' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['currency', 'percentage', 'factor'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be currency, percentage, or factor' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const exists = mockGlobalInputs.find(input => input.name === body.name);

    if (exists) {
      return NextResponse.json(
        { error: 'Global input with this name already exists' },
        { status: 409 }
      );
    }

    const newInput: GlobalInput = {
      id: `gi-${Date.now()}`,
      name: body.name,
      value: parseFloat(body.value),
      type: body.type,
      description: body.description || '',
      effectiveDate: body.effectiveDate || new Date().toISOString().split('T')[0],
    };

    // In production: await db.globalInputs.create({ data: newInput })
    mockGlobalInputs.push(newInput);

    return NextResponse.json({
      success: true,
      data: newInput,
      message: 'Global input created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Global Inputs POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create global input', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const index = mockGlobalInputs.findIndex(input => input.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Global input not found' },
        { status: 404 }
      );
    }

    // Update fields
    const updated: GlobalInput = {
      ...mockGlobalInputs[index],
      ...(body.name && { name: body.name }),
      ...(body.value !== undefined && { value: parseFloat(body.value) }),
      ...(body.type && { type: body.type }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.effectiveDate && { effectiveDate: body.effectiveDate }),
    };

    // In production: await db.globalInputs.update({ where: { id: body.id }, data: updated })
    mockGlobalInputs[index] = updated;

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Global input updated successfully',
    });

  } catch (error) {
    console.error('Global Inputs PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update global input', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const index = mockGlobalInputs.findIndex(input => input.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Global input not found' },
        { status: 404 }
      );
    }

    // In production: await db.globalInputs.delete({ where: { id } })
    const deleted = mockGlobalInputs.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Global input deleted successfully',
    });

  } catch (error) {
    console.error('Global Inputs DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete global input', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
