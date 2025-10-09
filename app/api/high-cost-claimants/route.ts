import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  insertHighCostClaimant,
  insertManyHighCostClaimants,
  getHighCostClaimants,
  getTopHighCostClaimants,
  getClaimantsByDiagnosis,
  getDiagnosisBreakdown,
  getClaimantsStats,
  updateHighCostClaimant,
  deleteHighCostClaimant,
  deleteAllHighCostClaimants
} from '@/lib/db/queries/claimants';

// GET: Fetch high-cost claimants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action');
    const limit = searchParams.get('limit');
    const diagnosisCode = searchParams.get('diagnosisCode');

    // Get statistics
    if (action === 'stats') {
      const stats = await getClaimantsStats(userId);
      return NextResponse.json({
        success: true,
        data: stats,
        message: 'Statistics calculated successfully'
      } as ApiResponse<typeof stats>);
    }

    // Get diagnosis breakdown
    if (action === 'diagnosis-breakdown') {
      const breakdown = await getDiagnosisBreakdown(userId);
      return NextResponse.json({
        success: true,
        data: breakdown,
        message: `Found ${breakdown.length} diagnoses`
      } as ApiResponse<typeof breakdown>);
    }

    // Get by diagnosis code
    if (diagnosisCode) {
      const data = await getClaimantsByDiagnosis(diagnosisCode, userId);
      return NextResponse.json({
        success: true,
        data,
        message: `Found ${data.length} claimants with diagnosis ${diagnosisCode}`
      } as ApiResponse<typeof data>);
    }

    // Get top N claimants
    if (action === 'top' || limit) {
      const limitNum = limit ? parseInt(limit) : 10;
      const data = await getTopHighCostClaimants(limitNum, userId);
      return NextResponse.json({
        success: true,
        data,
        message: `Found top ${data.length} high-cost claimants`
      } as ApiResponse<typeof data>);
    }

    // Get all
    const data = await getHighCostClaimants(userId);
    return NextResponse.json({
      success: true,
      data,
      message: `Found ${data.length} high-cost claimants`
    } as ApiResponse<typeof data>);

  } catch (error) {
    console.error('GET /api/high-cost-claimants error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch high-cost claimants'
    } as ApiResponse<null>, { status: 500 });
  }
}

// POST: Create new high-cost claimants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, records } = body;

    // Handle bulk insert
    if (action === 'bulk' || records) {
      const dataToInsert = records || data;
      if (!Array.isArray(dataToInsert)) {
        return NextResponse.json({
          success: false,
          error: 'Bulk insert requires an array of records'
        } as ApiResponse<null>, { status: 400 });
      }

      const inserted = await insertManyHighCostClaimants(dataToInsert);
      return NextResponse.json({
        success: true,
        data: inserted,
        message: `Inserted ${inserted.length} high-cost claimants`
      } as ApiResponse<typeof inserted>);
    }

    // Handle single insert
    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Data is required'
      } as ApiResponse<null>, { status: 400 });
    }

    const inserted = await insertHighCostClaimant(data);
    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'High-cost claimant created successfully'
    } as ApiResponse<typeof inserted>);

  } catch (error) {
    console.error('POST /api/high-cost-claimants error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create high-cost claimant'
    } as ApiResponse<null>, { status: 500 });
  }
}

// PUT: Update high-cost claimant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, data } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for update'
      } as ApiResponse<null>, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Data is required for update'
      } as ApiResponse<null>, { status: 400 });
    }

    const updated = await updateHighCostClaimant(id, data);

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'High-cost claimant not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'High-cost claimant updated successfully'
    } as ApiResponse<typeof updated>);

  } catch (error) {
    console.error('PUT /api/high-cost-claimants error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update high-cost claimant'
    } as ApiResponse<null>, { status: 500 });
  }
}

// DELETE: Delete high-cost claimants
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;
    const deleteAll = searchParams.get('deleteAll') === 'true';

    // Delete all records
    if (deleteAll) {
      const deleted = await deleteAllHighCostClaimants(userId);
      return NextResponse.json({
        success: true,
        data: { count: deleted.length },
        message: `Deleted ${deleted.length} high-cost claimants`
      } as ApiResponse<{ count: number }>);
    }

    // Delete single record
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for delete'
      } as ApiResponse<null>, { status: 400 });
    }

    const deleted = await deleteHighCostClaimant(id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'High-cost claimant not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'High-cost claimant deleted successfully'
    } as ApiResponse<typeof deleted>);

  } catch (error) {
    console.error('DELETE /api/high-cost-claimants error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete high-cost claimant'
    } as ApiResponse<null>, { status: 500 });
  }
}
