import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/connection';
import { readFileSync } from 'fs';
import { join } from 'path';

// POST: Initialize database with schema
export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in non-production or with special key
    const { searchParams } = new URL(request.url);
    const initKey = searchParams.get('key');

    // Simple security - require a key parameter
    if (process.env.NODE_ENV === 'production' && initKey !== 'init-db-2024') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized. Use ?key=init-db-2024 to initialize the database.'
      }, { status: 403 });
    }

    // Read the init-db.sql file
    const sqlFilePath = join(process.cwd(), 'scripts', 'init-db.sql');
    let sqlContent: string;

    try {
      sqlContent = readFileSync(sqlFilePath, 'utf-8');
    } catch {
      // Error reading file - likely doesn't exist
      return NextResponse.json({
        success: false,
        error: 'Could not read init-db.sql file. Make sure it exists in scripts/init-db.sql'
      }, { status: 500 });
    }

    // Execute the SQL
    // Note: postgres client handles multiple statements differently
    // We'll execute them in a transaction
    await sql.unsafe(sqlContent);

    // Verify tables were created
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      data: {
        tablesCreated: tables.map(t => t.tableName),
        tableCount: tables.length
      }
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database initialization failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET: Show initialization instructions
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Database initialization endpoint',
    instructions: {
      step1: 'Make sure scripts/init-db.sql exists in your project',
      step2: 'Send a POST request to this endpoint with ?key=init-db-2024',
      step3: 'Example: POST /api/init-database?key=init-db-2024',
      warning: 'This will create all database tables. Only run once!',
      security: 'The key "init-db-2024" is required to prevent accidental initialization'
    },
    curlExample: 'curl -X POST "https://your-app.onrender.com/api/init-database?key=init-db-2024"'
  });
}
