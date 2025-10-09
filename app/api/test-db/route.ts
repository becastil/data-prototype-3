import { NextResponse } from 'next/server';
import sql from '@/lib/db/connection';

export async function GET() {
  try {
    // Test 1: Basic connection test
    const timeResult = await sql`SELECT NOW() as current_time`;
    const currentTime = timeResult[0]?.currentTime;

    // Test 2: Check if tables exist
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const tableNames = tablesResult.map(row => row.tableName);

    // Test 3: Get database version
    const versionResult = await sql`SELECT version()`;
    const dbVersion = versionResult[0]?.version;

    // Test 4: Count records in main tables (if they exist)
    const recordCounts: Record<string, number> = {};

    if (tableNames.includes('experience_data')) {
      const count = await sql`SELECT COUNT(*) as count FROM experience_data`;
      recordCounts.experienceData = Number(count[0]?.count || 0);
    }

    if (tableNames.includes('high_cost_claimants')) {
      const count = await sql`SELECT COUNT(*) as count FROM high_cost_claimants`;
      recordCounts.highCostClaimants = Number(count[0]?.count || 0);
    }

    if (tableNames.includes('fee_structures')) {
      const count = await sql`SELECT COUNT(*) as count FROM fee_structures`;
      recordCounts.feeStructures = Number(count[0]?.count || 0);
    }

    if (tableNames.includes('monthly_summaries')) {
      const count = await sql`SELECT COUNT(*) as count FROM monthly_summaries`;
      recordCounts.monthlySummaries = Number(count[0]?.count || 0);
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connected: true,
        timestamp: currentTime,
        database: {
          version: dbVersion?.split(' ')[0] || 'Unknown',
          tables: tableNames,
          tableCount: tableNames.length
        },
        records: recordCounts,
        environment: process.env.NODE_ENV || 'development'
      }
    });

  } catch (error) {
    console.error('Database connection test failed:', error);

    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        connected: false,
        environment: process.env.NODE_ENV || 'development'
      }
    }, { status: 500 });
  }
}

// Optional POST endpoint to run the initialization script
export async function POST() {
  try {
    // In production, you might want to restrict this or require authentication
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'Database initialization is not allowed in production via API'
      }, { status: 403 });
    }

    // Read and execute the init script
    // Note: In practice, you'd run this script directly on the database
    return NextResponse.json({
      success: true,
      message: 'Please run the init-db.sql script directly on your database',
      instructions: [
        '1. Copy the content of scripts/init-db.sql',
        '2. Run it on your Render PostgreSQL instance using the Render dashboard or psql CLI',
        '3. Or use: psql $DATABASE_URL -f scripts/init-db.sql'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
