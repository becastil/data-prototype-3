import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  insertFeeStructure,
  insertManyFeeStructures,
  getFeeStructures,
  getFeeStructuresByMonth,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
  deleteAllFeeStructures,
  // V2 functions
  insertFeeStructureV2,
  getFeeStructuresV2,
  getFeeStructureV2ById,
  updateFeeStructureV2,
  deleteFeeStructureV2
} from '@/lib/db/queries/fees';

export const dynamic = 'force-dynamic';

// GET: Fetch fee structures
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const month = searchParams.get('month');
    const id = searchParams.get('id');
    const version = searchParams.get('version'); // 'v2' for new version
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    // Get V2 fee structures
    if (version === 'v2') {
      if (id) {
        const data = await getFeeStructureV2ById(id);
        return NextResponse.json({
          success: true,
          data: data || null,
          message: data ? 'Fee structure found' : 'Fee structure not found'
        } as ApiResponse<typeof data>);
      }

      const data = await getFeeStructuresV2(userId, activeOnly);
      return NextResponse.json({
        success: true,
        data,
        message: `Found ${data.length} fee structures`
      } as ApiResponse<typeof data>);
    }

    // Get by ID
    if (id) {
      const data = await getFeeStructureById(id);
      return NextResponse.json({
        success: true,
        data: data || null,
        message: data ? 'Fee structure found' : 'Fee structure not found'
      } as ApiResponse<typeof data>);
    }

    // Get by month
    if (month) {
      const data = await getFeeStructuresByMonth(month, userId);
      return NextResponse.json({
        success: true,
        data,
        message: `Found ${data.length} fee structures for ${month}`
      } as ApiResponse<typeof data>);
    }

    // Get all
    const data = await getFeeStructures(userId);
    return NextResponse.json({
      success: true,
      data,
      message: `Found ${data.length} fee structures`
    } as ApiResponse<typeof data>);

  } catch (error) {
    console.error('GET /api/fees error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch fee structures'
    } as ApiResponse<null>, { status: 500 });
  }
}

// POST: Create new fee structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, records, version } = body;

    // Handle V2
    if (version === 'v2') {
      if (!data) {
        return NextResponse.json({
          success: false,
          error: 'Data is required'
        } as ApiResponse<null>, { status: 400 });
      }

      const inserted = await insertFeeStructureV2(data);
      return NextResponse.json({
        success: true,
        data: inserted,
        message: 'Fee structure V2 created successfully'
      } as ApiResponse<typeof inserted>);
    }

    // Handle bulk insert
    if (action === 'bulk' || records) {
      const dataToInsert = records || data;
      if (!Array.isArray(dataToInsert)) {
        return NextResponse.json({
          success: false,
          error: 'Bulk insert requires an array of records'
        } as ApiResponse<null>, { status: 400 });
      }

      const inserted = await insertManyFeeStructures(dataToInsert);
      return NextResponse.json({
        success: true,
        data: inserted,
        message: `Inserted ${inserted.length} fee structures`
      } as ApiResponse<typeof inserted>);
    }

    // Handle single insert
    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Data is required'
      } as ApiResponse<null>, { status: 400 });
    }

    const inserted = await insertFeeStructure(data);
    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'Fee structure created successfully'
    } as ApiResponse<typeof inserted>);

  } catch (error) {
    console.error('POST /api/fees error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create fee structure'
    } as ApiResponse<null>, { status: 500 });
  }
}

// PUT: Update fee structure
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, data, version } = body;

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

    // Handle V2
    if (version === 'v2') {
      const updated = await updateFeeStructureV2(id, data);
      if (!updated) {
        return NextResponse.json({
          success: false,
          error: 'Fee structure not found'
        } as ApiResponse<null>, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Fee structure V2 updated successfully'
      } as ApiResponse<typeof updated>);
    }

    const updated = await updateFeeStructure(id, data);
    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Fee structure not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Fee structure updated successfully'
    } as ApiResponse<typeof updated>);

  } catch (error) {
    console.error('PUT /api/fees error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update fee structure'
    } as ApiResponse<null>, { status: 500 });
  }
}

// DELETE: Delete fee structure
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;
    const deleteAll = searchParams.get('deleteAll') === 'true';
    const version = searchParams.get('version');
    const hardDelete = searchParams.get('hardDelete') === 'true';

    // Delete all records
    if (deleteAll) {
      const deleted = await deleteAllFeeStructures(userId);
      return NextResponse.json({
        success: true,
        data: { count: deleted.length },
        message: `Deleted ${deleted.length} fee structures`
      } as ApiResponse<{ count: number }>);
    }

    // Delete single record
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for delete'
      } as ApiResponse<null>, { status: 400 });
    }

    // Handle V2
    if (version === 'v2') {
      const deleted = await deleteFeeStructureV2(id, hardDelete);
      if (!deleted) {
        return NextResponse.json({
          success: false,
          error: 'Fee structure not found'
        } as ApiResponse<null>, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: deleted,
        message: hardDelete ? 'Fee structure deleted permanently' : 'Fee structure deactivated'
      } as ApiResponse<typeof deleted>);
    }

    const deleted = await deleteFeeStructure(id);
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Fee structure not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Fee structure deleted successfully'
    } as ApiResponse<typeof deleted>);

  } catch (error) {
    console.error('DELETE /api/fees error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete fee structure'
    } as ApiResponse<null>, { status: 500 });
  }
}
