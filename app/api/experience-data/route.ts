import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  insertExperienceData,
  insertManyExperienceData,
  getExperienceData,
  getExperienceDataByMonth,
  getExperienceDataByDateRange,
  updateExperienceData,
  deleteExperienceData,
  deleteAllExperienceData,
  upsertExperienceData,
  getTotalClaims
} from '@/lib/db/queries/experience-data';

// GET: Fetch experience data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const month = searchParams.get('month');
    const startMonth = searchParams.get('startMonth');
    const endMonth = searchParams.get('endMonth');
    const action = searchParams.get('action');

    // Handle different GET actions
    if (action === 'totals') {
      const totals = await getTotalClaims(startMonth || undefined, endMonth || undefined, userId);
      return NextResponse.json({
        success: true,
        data: totals,
        message: 'Total claims calculated successfully'
      } as ApiResponse<typeof totals>);
    }

    // Get by month
    if (month) {
      const data = await getExperienceDataByMonth(month, userId);
      return NextResponse.json({
        success: true,
        data: data || null,
        message: data ? 'Experience data found' : 'No data found for this month'
      } as ApiResponse<typeof data>);
    }

    // Get by date range
    if (startMonth && endMonth) {
      const data = await getExperienceDataByDateRange(startMonth, endMonth, userId);
      return NextResponse.json({
        success: true,
        data,
        message: `Found ${data.length} records`
      } as ApiResponse<typeof data>);
    }

    // Get all
    const data = await getExperienceData(userId);
    return NextResponse.json({
      success: true,
      data,
      message: `Found ${data.length} experience data records`
    } as ApiResponse<typeof data>);

  } catch (error) {
    console.error('GET /api/experience-data error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch experience data'
    } as ApiResponse<null>, { status: 500 });
  }
}

// POST: Create new experience data (single or bulk)
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

      const inserted = await insertManyExperienceData(dataToInsert);
      return NextResponse.json({
        success: true,
        data: inserted,
        message: `Inserted ${inserted.length} experience data records`
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

      const result = await upsertExperienceData(data);
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Experience data upserted successfully'
      } as ApiResponse<typeof result>);
    }

    // Handle single insert
    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Data is required'
      } as ApiResponse<null>, { status: 400 });
    }

    const inserted = await insertExperienceData(data);
    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'Experience data created successfully'
    } as ApiResponse<typeof inserted>);

  } catch (error) {
    console.error('POST /api/experience-data error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create experience data'
    } as ApiResponse<null>, { status: 500 });
  }
}

// PUT: Update experience data
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

    const updated = await updateExperienceData(id, data);

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Experience data not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Experience data updated successfully'
    } as ApiResponse<typeof updated>);

  } catch (error) {
    console.error('PUT /api/experience-data error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update experience data'
    } as ApiResponse<null>, { status: 500 });
  }
}

// DELETE: Delete experience data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;
    const deleteAll = searchParams.get('deleteAll') === 'true';

    // Delete all records
    if (deleteAll) {
      const deleted = await deleteAllExperienceData(userId);
      return NextResponse.json({
        success: true,
        data: { count: deleted.length },
        message: `Deleted ${deleted.length} experience data records`
      } as ApiResponse<{ count: number }>);
    }

    // Delete single record
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for delete'
      } as ApiResponse<null>, { status: 400 });
    }

    const deleted = await deleteExperienceData(id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Experience data not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Experience data deleted successfully'
    } as ApiResponse<typeof deleted>);

  } catch (error) {
    console.error('DELETE /api/experience-data error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete experience data'
    } as ApiResponse<null>, { status: 500 });
  }
}
