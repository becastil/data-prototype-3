import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import sql from '@/lib/db/connection';

// GET: Get database statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    // Build WHERE clause for user filtering
    const userFilter = userId ? sql`WHERE user_id = ${userId}` : sql``;

    // Get record counts for all main tables
    const [experienceCount] = await sql`
      SELECT COUNT(*) as count
      FROM experience_data
      ${userFilter}
    `;

    const [claimantsCount] = await sql`
      SELECT COUNT(*) as count
      FROM high_cost_claimants
      ${userFilter}
    `;

    const [feesCount] = await sql`
      SELECT COUNT(*) as count
      FROM fee_structures
      ${userFilter}
    `;

    const [feesV2Count] = await sql`
      SELECT COUNT(*) as count
      FROM fee_structures_v2
      ${userFilter}
    `;

    const [summariesCount] = await sql`
      SELECT COUNT(*) as count
      FROM monthly_summaries
      ${userFilter}
    `;

    const [configsCount] = await sql`
      SELECT COUNT(*) as count
      FROM dashboard_configs
      ${userFilter}
    `;

    const [uploadsCount] = await sql`
      SELECT COUNT(*) as count
      FROM file_uploads
      ${userFilter}
    `;

    // Get total claims and enrollment from experience data
    let totalStats = null;
    if (experienceCount.count > 0) {
      const [stats] = await sql`
        SELECT
          SUM(domestic_medical_ip + domestic_medical_op + non_domestic_medical +
              prescription_drugs + dental + vision + mental_health + preventive_care +
              emergency_room + urgent_care + specialty_care + lab_diagnostic +
              physical_therapy + dme + home_health) AS total_claims,
          SUM(enrollment) AS total_enrollment,
          AVG(enrollment) AS avg_enrollment
        FROM experience_data
        ${userFilter}
      `;
      totalStats = stats;
    }

    // Get high-cost claimants stats
    let claimantsStats = null;
    if (claimantsCount.count > 0) {
      const [stats] = await sql`
        SELECT
          SUM(total_paid_amount) AS total_high_cost_amount,
          AVG(total_paid_amount) AS avg_high_cost_amount,
          MAX(total_paid_amount) AS max_high_cost_amount,
          AVG(risk_score) AS avg_risk_score
        FROM high_cost_claimants
        ${userFilter}
      `;
      claimantsStats = stats;
    }

    // Get summary stats
    let summaryStats = null;
    if (summariesCount.count > 0) {
      const [stats] = await sql`
        SELECT
          AVG(monthly_loss_ratio) AS avg_loss_ratio,
          MAX(monthly_loss_ratio) AS max_loss_ratio,
          MIN(monthly_loss_ratio) AS min_loss_ratio,
          SUM(claims) AS total_claims_from_summaries,
          SUM(fees) AS total_fees,
          SUM(premiums) AS total_premiums
        FROM monthly_summaries
        ${userFilter}
      `;
      summaryStats = stats;
    }

    // Get database size (only works if user has permissions)
    let databaseSize = null;
    try {
      const [dbSize] = await sql`
        SELECT
          pg_size_pretty(pg_database_size(current_database())) AS size,
          pg_database_size(current_database()) AS size_bytes
      `;
      databaseSize = dbSize;
    } catch (error) {
      console.log('Could not fetch database size:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        recordCounts: {
          experienceData: Number(experienceCount.count || 0),
          highCostClaimants: Number(claimantsCount.count || 0),
          feeStructures: Number(feesCount.count || 0),
          feeStructuresV2: Number(feesV2Count.count || 0),
          monthlySummaries: Number(summariesCount.count || 0),
          dashboardConfigs: Number(configsCount.count || 0),
          fileUploads: Number(uploadsCount.count || 0)
        },
        experienceDataStats: totalStats ? {
          totalClaims: Number(totalStats.totalClaims || 0),
          totalEnrollment: Number(totalStats.totalEnrollment || 0),
          avgEnrollment: Number(totalStats.avgEnrollment || 0)
        } : null,
        highCostClaimantsStats: claimantsStats ? {
          totalHighCostAmount: Number(claimantsStats.totalHighCostAmount || 0),
          avgHighCostAmount: Number(claimantsStats.avgHighCostAmount || 0),
          maxHighCostAmount: Number(claimantsStats.maxHighCostAmount || 0),
          avgRiskScore: Number(claimantsStats.avgRiskScore || 0)
        } : null,
        summaryStats: summaryStats ? {
          avgLossRatio: Number(summaryStats.avgLossRatio || 0),
          maxLossRatio: Number(summaryStats.maxLossRatio || 0),
          minLossRatio: Number(summaryStats.minLossRatio || 0),
          totalClaims: Number(summaryStats.totalClaimsFromSummaries || 0),
          totalFees: Number(summaryStats.totalFees || 0),
          totalPremiums: Number(summaryStats.totalPremiums || 0)
        } : null,
        database: databaseSize
      },
      message: 'Statistics retrieved successfully'
    } as ApiResponse<any>);

  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics'
    } as ApiResponse<null>, { status: 500 });
  }
}
