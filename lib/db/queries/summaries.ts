import sql from '../connection';
import type { MonthlySummary } from '@/types/healthcare';

export interface InsertMonthlySummaryParams {
  userId?: string;
  month: string;
  claims: number;
  fees: number;
  premiums: number;
  totalCost: number;
  monthlyLossRatio: number;
  rolling12LossRatio?: number;
  variance?: number;
  memberMonths: number;
  pmpm: number;
}

/**
 * Insert a single monthly summary
 */
export async function insertMonthlySummary(data: InsertMonthlySummaryParams) {
  const result = await sql`
    INSERT INTO monthly_summaries ${sql(data)}
    RETURNING *
  `;
  return result[0];
}

/**
 * Insert multiple monthly summaries (bulk insert)
 */
export async function insertManyMonthlySummaries(records: InsertMonthlySummaryParams[]) {
  const result = await sql`
    INSERT INTO monthly_summaries ${sql(records)}
    RETURNING *
  `;
  return result;
}

/**
 * Get all monthly summaries for a user
 */
export async function getMonthlySummaries(userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM monthly_summaries
      ORDER BY month ASC
    `;
  }

  return await sql`
    SELECT * FROM monthly_summaries
    WHERE user_id = ${userId}
    ORDER BY month ASC
  `;
}

/**
 * Get monthly summary for a specific month
 */
export async function getMonthlySummaryByMonth(month: string, userId?: string) {
  if (!userId) {
    const result = await sql`
      SELECT * FROM monthly_summaries
      WHERE month = ${month}
      LIMIT 1
    `;
    return result[0];
  }

  const result = await sql`
    SELECT * FROM monthly_summaries
    WHERE month = ${month} AND user_id = ${userId}
    LIMIT 1
  `;
  return result[0];
}

/**
 * Get monthly summaries for a date range
 */
export async function getMonthlySummariesByDateRange(startMonth: string, endMonth: string, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM monthly_summaries
      WHERE month >= ${startMonth} AND month <= ${endMonth}
      ORDER BY month ASC
    `;
  }

  return await sql`
    SELECT * FROM monthly_summaries
    WHERE month >= ${startMonth} AND month <= ${endMonth} AND user_id = ${userId}
    ORDER BY month ASC
  `;
}

/**
 * Get latest N months of summaries
 */
export async function getLatestMonthlySummaries(limit = 12, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM monthly_summaries
      ORDER BY month DESC
      LIMIT ${limit}
    `;
  }

  return await sql`
    SELECT * FROM monthly_summaries
    WHERE user_id = ${userId}
    ORDER BY month DESC
    LIMIT ${limit}
  `;
}

/**
 * Get summaries with loss ratio above threshold
 */
export async function getSummariesAboveLossRatio(threshold: number, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM monthly_summaries
      WHERE monthly_loss_ratio > ${threshold}
      ORDER BY monthly_loss_ratio DESC
    `;
  }

  return await sql`
    SELECT * FROM monthly_summaries
    WHERE monthly_loss_ratio > ${threshold} AND user_id = ${userId}
    ORDER BY monthly_loss_ratio DESC
  `;
}

/**
 * Calculate and update rolling 12-month loss ratio
 */
export async function updateRolling12LossRatio(userId?: string) {
  // This is a more complex query that calculates rolling 12-month average
  if (!userId) {
    await sql`
      UPDATE monthly_summaries AS ms
      SET rolling_12_loss_ratio = (
        SELECT AVG(monthly_loss_ratio)
        FROM monthly_summaries AS ms2
        WHERE ms2.month <= ms.month
        ORDER BY ms2.month DESC
        LIMIT 12
      )
    `;
  } else {
    await sql`
      UPDATE monthly_summaries AS ms
      SET rolling_12_loss_ratio = (
        SELECT AVG(monthly_loss_ratio)
        FROM monthly_summaries AS ms2
        WHERE ms2.month <= ms.month AND ms2.user_id = ${userId}
        ORDER BY ms2.month DESC
        LIMIT 12
      )
      WHERE ms.user_id = ${userId}
    `;
  }
}

/**
 * Get aggregate statistics across all summaries
 */
export async function getSummaryStats(userId?: string) {
  if (!userId) {
    const result = await sql`
      SELECT
        COUNT(*) AS total_months,
        SUM(claims) AS total_claims,
        SUM(fees) AS total_fees,
        SUM(premiums) AS total_premiums,
        SUM(total_cost) AS total_cost,
        AVG(monthly_loss_ratio) AS avg_loss_ratio,
        MAX(monthly_loss_ratio) AS max_loss_ratio,
        MIN(monthly_loss_ratio) AS min_loss_ratio,
        SUM(member_months) AS total_member_months,
        AVG(pmpm) AS avg_pmpm
      FROM monthly_summaries
    `;
    return result[0];
  }

  const result = await sql`
    SELECT
      COUNT(*) AS total_months,
      SUM(claims) AS total_claims,
      SUM(fees) AS total_fees,
      SUM(premiums) AS total_premiums,
      SUM(total_cost) AS total_cost,
      AVG(monthly_loss_ratio) AS avg_loss_ratio,
      MAX(monthly_loss_ratio) AS max_loss_ratio,
      MIN(monthly_loss_ratio) AS min_loss_ratio,
      SUM(member_months) AS total_member_months,
      AVG(pmpm) AS avg_pmpm
    FROM monthly_summaries
    WHERE user_id = ${userId}
  `;
  return result[0];
}

/**
 * Update monthly summary
 */
export async function updateMonthlySummary(id: string, data: Partial<InsertMonthlySummaryParams>) {
  const result = await sql`
    UPDATE monthly_summaries
    SET ${sql(data)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete monthly summary by ID
 */
export async function deleteMonthlySummary(id: string) {
  const result = await sql`
    DELETE FROM monthly_summaries
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete all monthly summaries for a user
 */
export async function deleteAllMonthlySummaries(userId?: string) {
  if (!userId) {
    return await sql`DELETE FROM monthly_summaries RETURNING *`;
  }

  return await sql`
    DELETE FROM monthly_summaries
    WHERE user_id = ${userId}
    RETURNING *
  `;
}

/**
 * Upsert monthly summary (insert or update on conflict)
 */
export async function upsertMonthlySummary(data: InsertMonthlySummaryParams) {
  const result = await sql`
    INSERT INTO monthly_summaries ${sql(data)}
    ON CONFLICT (user_id, month)
    DO UPDATE SET
      claims = EXCLUDED.claims,
      fees = EXCLUDED.fees,
      premiums = EXCLUDED.premiums,
      total_cost = EXCLUDED.total_cost,
      monthly_loss_ratio = EXCLUDED.monthly_loss_ratio,
      rolling_12_loss_ratio = EXCLUDED.rolling_12_loss_ratio,
      variance = EXCLUDED.variance,
      member_months = EXCLUDED.member_months,
      pmpm = EXCLUDED.pmpm,
      updated_at = NOW()
    RETURNING *
  `;
  return result[0];
}
