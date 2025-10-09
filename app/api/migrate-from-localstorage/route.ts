import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { insertManyExperienceData, upsertExperienceData } from '@/lib/db/queries/experience-data';
import { insertManyHighCostClaimants } from '@/lib/db/queries/claimants';
import { insertManyFeeStructures, insertFeeStructureV2 } from '@/lib/db/queries/fees';
import { insertManyMonthlySummaries, upsertMonthlySummary } from '@/lib/db/queries/summaries';
import { insertDashboardConfig } from '@/lib/db/queries/config';

interface MigrationData {
  experienceData?: Record<string, unknown>[];
  highCostClaimants?: Record<string, unknown>[];
  feeStructures?: Record<string, unknown>[];
  feeStructuresV2?: Record<string, unknown>[];
  monthlySummaries?: Record<string, unknown>[];
  dashboardConfig?: Record<string, unknown>;
  userId?: string;
}

interface MigrationResult {
  experienceData: number;
  highCostClaimants: number;
  feeStructures: number;
  feeStructuresV2: number;
  monthlySummaries: number;
  dashboardConfig: number;
  errors: string[];
}

// POST: Migrate data from localStorage to database
export async function POST(request: NextRequest) {
  try {
    const body: MigrationData = await request.json();
    const {
      experienceData,
      highCostClaimants,
      feeStructures,
      feeStructuresV2,
      monthlySummaries,
      dashboardConfig,
      userId
    } = body;

    const result: MigrationResult = {
      experienceData: 0,
      highCostClaimants: 0,
      feeStructures: 0,
      feeStructuresV2: 0,
      monthlySummaries: 0,
      dashboardConfig: 0,
      errors: []
    };

    // Migrate Experience Data
    if (experienceData && Array.isArray(experienceData) && experienceData.length > 0) {
      try {
        // Add userId to each record if provided
        const recordsToInsert = experienceData.map(record => ({
          ...record,
          userId: userId || record.userId
        }));

        // Use upsert to avoid duplicates
        for (const record of recordsToInsert) {
          try {
            await upsertExperienceData(record);
            result.experienceData++;
          } catch (error) {
            result.errors.push(`Experience data error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        result.errors.push(`Experience data migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Migrate High-Cost Claimants
    if (highCostClaimants && Array.isArray(highCostClaimants) && highCostClaimants.length > 0) {
      try {
        const recordsToInsert = highCostClaimants.map(record => ({
          ...record,
          userId: userId || record.userId
        }));

        const inserted = await insertManyHighCostClaimants(recordsToInsert);
        result.highCostClaimants = inserted.length;
      } catch (error) {
        result.errors.push(`High-cost claimants migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Migrate Fee Structures (V1)
    if (feeStructures && Array.isArray(feeStructures) && feeStructures.length > 0) {
      try {
        const recordsToInsert = feeStructures.map(record => ({
          ...record,
          userId: userId || record.userId
        }));

        const inserted = await insertManyFeeStructures(recordsToInsert);
        result.feeStructures = inserted.length;
      } catch (error) {
        result.errors.push(`Fee structures migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Migrate Fee Structures V2
    if (feeStructuresV2 && Array.isArray(feeStructuresV2) && feeStructuresV2.length > 0) {
      try {
        for (const record of feeStructuresV2) {
          try {
            await insertFeeStructureV2({
              ...record,
              userId: userId || record.userId
            });
            result.feeStructuresV2++;
          } catch (error) {
            result.errors.push(`Fee structure V2 error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        result.errors.push(`Fee structures V2 migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Migrate Monthly Summaries
    if (monthlySummaries && Array.isArray(monthlySummaries) && monthlySummaries.length > 0) {
      try {
        // Use upsert to avoid duplicates
        for (const record of monthlySummaries) {
          try {
            await upsertMonthlySummary({
              ...record,
              userId: userId || record.userId
            });
            result.monthlySummaries++;
          } catch (error) {
            result.errors.push(`Monthly summary error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        result.errors.push(`Monthly summaries migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Migrate Dashboard Config
    if (dashboardConfig) {
      try {
        await insertDashboardConfig({
          ...dashboardConfig,
          userId: userId || dashboardConfig.userId,
          isActive: true
        });
        result.dashboardConfig = 1;
      } catch (error) {
        result.errors.push(`Dashboard config migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Calculate total migrated
    const totalMigrated =
      result.experienceData +
      result.highCostClaimants +
      result.feeStructures +
      result.feeStructuresV2 +
      result.monthlySummaries +
      result.dashboardConfig;

    return NextResponse.json({
      success: result.errors.length === 0 || totalMigrated > 0,
      data: result,
      message: result.errors.length > 0
        ? `Migration completed with ${result.errors.length} errors. Migrated ${totalMigrated} records.`
        : `Successfully migrated ${totalMigrated} records from localStorage to database`
    } as ApiResponse<MigrationResult>);

  } catch (error) {
    console.error('POST /api/migrate-from-localstorage error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    } as ApiResponse<null>, { status: 500 });
  }
}

// GET: Get migration status/instructions
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Migration endpoint ready',
    instructions: {
      method: 'POST',
      body: {
        experienceData: 'Array of experience data records',
        highCostClaimants: 'Array of high-cost claimant records',
        feeStructures: 'Array of fee structure records',
        feeStructuresV2: 'Array of fee structure V2 records',
        monthlySummaries: 'Array of monthly summary records',
        dashboardConfig: 'Dashboard configuration object',
        userId: 'Optional user ID to associate with all records'
      },
      example: `
        fetch('/api/migrate-from-localstorage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experienceData: [...],
            highCostClaimants: [...],
            feeStructures: [...],
            monthlySummaries: [...],
            dashboardConfig: {...}
          })
        })
      `
    }
  });
}
