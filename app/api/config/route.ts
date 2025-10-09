import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  getActiveDashboardConfig,
  getDashboardConfigs,
  getDashboardConfigById,
  insertDashboardConfig,
  updateDashboardConfig,
  setActiveDashboardConfig,
  deleteDashboardConfig,
  getOrCreateDefaultConfig
} from '@/lib/db/queries/config';

// GET: Fetch dashboard configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    // Get or create default config
    if (action === 'default') {
      const config = await getOrCreateDefaultConfig(userId);
      return NextResponse.json({
        success: true,
        data: config,
        message: 'Default configuration retrieved'
      } as ApiResponse<typeof config>);
    }

    // Get by ID
    if (id) {
      const config = await getDashboardConfigById(id);
      return NextResponse.json({
        success: true,
        data: config || null,
        message: config ? 'Configuration found' : 'Configuration not found'
      } as ApiResponse<typeof config>);
    }

    // Get active config
    if (action === 'active') {
      const config = await getActiveDashboardConfig(userId);
      return NextResponse.json({
        success: true,
        data: config || null,
        message: config ? 'Active configuration found' : 'No active configuration'
      } as ApiResponse<typeof config>);
    }

    // Get all configs
    const configs = await getDashboardConfigs(userId);
    return NextResponse.json({
      success: true,
      data: configs,
      message: `Found ${configs.length} configurations`
    } as ApiResponse<typeof configs>);

  } catch (error) {
    console.error('GET /api/config error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch configuration'
    } as ApiResponse<null>, { status: 500 });
  }
}

// POST: Create new dashboard configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, setActive } = body;

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Configuration data is required'
      } as ApiResponse<null>, { status: 400 });
    }

    const inserted = await insertDashboardConfig(data);

    // Set as active if requested
    if (setActive && inserted.id) {
      await setActiveDashboardConfig(inserted.id, data.userId);
    }

    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'Dashboard configuration created successfully'
    } as ApiResponse<typeof inserted>);

  } catch (error) {
    console.error('POST /api/config error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create configuration'
    } as ApiResponse<null>, { status: 500 });
  }
}

// PUT: Update dashboard configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, data, setActive } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for update'
      } as ApiResponse<null>, { status: 400 });
    }

    // Set as active if requested
    if (setActive) {
      const userId = data?.userId || undefined;
      const activated = await setActiveDashboardConfig(id, userId);
      return NextResponse.json({
        success: true,
        data: activated,
        message: 'Configuration set as active'
      } as ApiResponse<typeof activated>);
    }

    // Regular update
    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Data is required for update'
      } as ApiResponse<null>, { status: 400 });
    }

    const updated = await updateDashboardConfig(id, data);

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Dashboard configuration updated successfully'
    } as ApiResponse<typeof updated>);

  } catch (error) {
    console.error('PUT /api/config error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update configuration'
    } as ApiResponse<null>, { status: 500 });
  }
}

// DELETE: Delete dashboard configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required for delete'
      } as ApiResponse<null>, { status: 400 });
    }

    const deleted = await deleteDashboardConfig(id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Dashboard configuration deleted successfully'
    } as ApiResponse<typeof deleted>);

  } catch (error) {
    console.error('DELETE /api/config error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete configuration'
    } as ApiResponse<null>, { status: 500 });
  }
}
