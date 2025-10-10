import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  insertMonthlySummary,
  insertManyMonthlySummaries,
  getMonthlySummaries,
  getMonthlySummaryByMonth,
  getMonthlySummariesByDateRange,
  getLatestMonthlySummaries,
  getSummaryStats,
  updateRolling12LossRatio,
  updateMonthlySummary,
  deleteMonthlySummary,
  deleteAllMonthlySummaries,
  upsertMonthlySummary
} from '@/lib/db/queries/summaries';

export const dynamic = 'force-dynamic';

// GET: Fetch monthly summaries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const month = searchParams.get('month');
    const startMonth = searchParams.get('startMonth');
    const endMonth = searchParams.get('endMonth');
    const action = searchParams.get('action');
    const limit = searchParams.get('limit');

    // Get statistics
    if (action === 'stats') {
      const stats = await getSummaryStats(userId);
      return NextResponse.json({
        success: true,
        data: stats,
        message: 'Summary statistics calculated successfully'
      } as ApiResponse<typeof stats>);
    }

    // Get latest N months
    if (action === 'latest' || limit) {
      const limitNum = limit ? parseInt(limit) : 12;
      const data = await getLatestMonthlySummaries(limitNum, userId);
      return NextResponse.json({
        success: true,
        data,
        message: `Found ${data.length} recent summaries`
      } as ApiResponse<typeof data>);
    }

    // Get by month
    if (month) {
      const data = await getMonthlySummaryByMonth(month, userId);
      return NextResponse.json({
        success: true,
        data: data || null,
        message: data ? 'Monthly summary found' : 'No summary found for this month'
      } as ApiResponse<typeof data>);
    }

    // Get by date range
    if (startMonth && endMonth) {
      const data = await getMonthlySummariesByDateRange(startMonth, endMonth, userId);
      return NextResponse.json({
        success: true,
        data,
        message: `Found ${data.length} summaries`
      } as ApiResponse<typeof data>);
    }

    // Get all
    const data = await getMonthlySummaries(userId);
    return NextResponse.json({
      success: true,
      data,
      message: `Found ${data.length} monthly summaries`
    } as ApiResponse<typeof data>);

  } catch (error) {
    console.error('GET /api/summaries error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monthly summaries'
    } as ApiResponse<null>, { status: 500 });
  }
}

// POST: Create new monthly summaries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, records } = body;

    // Update rolling 12-month loss ratio
    if (action === 'update-rolling-12') {
      const userId = body.userId || undefined;
      await updateRolling12LossRatio(userId);
      return NextResponse.json({
        success: true,
        message: 'Rolling 12-month loss ratios updated successfully'
      } as ApiResponse<null>);
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

      const inserted = await insertManyMonthlySummaries(dataToInsert);
      return NextResponse.json({
        success: true,
        data: inserted,
        message: `Inserted ${inserted.length} monthly summaries`
      } as ApiResponse<typeof inserted>);
    }

    // Handle upsert (insert or update on conflict)
    if (action === 'upsert') {
      if (!data) {
        return NextResponse.json({
          success: false,
          error: 'Data is required for upsert'
        } as ApiResponse<null>, { status: 400 });
      }

      const result = await upsertMonthlySummary(data);
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Monthly summary upserted successfully'
      } as ApiResponse<typeof result>);
    }

    // Handle single insert
    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Data is required'
      } as ApiResponse<null>, { status: 400 });
    }

    const inserted = await insertMonthlySummary(data);
    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'Monthly summary created successfully'
    } as ApiResponse<typeof inserted>);

  } catch (error) {
    console.error('POST /api/summaries error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create monthly summary'
    } as ApiResponse<null>, { status: 500 });
  }
}

// PUT: Update monthly summary
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

    const updated = await updateMonthlySummary(id, data);

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Monthly summary not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Monthly summary updated successfully'
    } as ApiResponse<typeof updated>);

  } catch (error) {
    console.error('PUT /api/summaries error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update monthly summary'
    } as ApiResponse<null>, { status: 500 });
  }
}

// DELETE: Delete monthly summaries
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;
    const deleteAll = searchParams.get('deleteAll') === 'true';

    // Delete all records
    if (deleteAll) {
      const deleted = await deleteAllMonthlySummaries(userId);
      return NextResponse.json({
        success: true,
        data: { count: deleted.length },
        message: `Deleted ${deleted.length} monthly summaries`
      } as ApiResponse<{ count: number }>);
    }

    // Delete single record
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for delete'
      } as ApiResponse<null>, { status: 400 });
    }

    const deleted = await deleteMonthlySummary(id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Monthly summary not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Monthly summary deleted successfully'
    } as ApiResponse<typeof deleted>);

  } catch (error) {
    console.error('DELETE /api/summaries error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete monthly summary'
    } as ApiResponse<null>, { status: 500 });
  }
}
