import sql from '../connection';
import type { HighCostClaimant } from '@/types/healthcare';

export interface InsertHighCostClaimantParams {
  userId?: string;
  memberId: string;
  age: number;
  gender: 'M' | 'F';
  primaryDiagnosisCode: string;
  primaryDiagnosisDescription: string;
  totalPaidAmount: number;
  claimCount: number;
  enrollmentMonths: number;
  riskScore: number;
}

/**
 * Insert a single high-cost claimant
 */
export async function insertHighCostClaimant(data: InsertHighCostClaimantParams) {
  const result = await sql`
    INSERT INTO high_cost_claimants ${sql(data)}
    RETURNING *
  `;
  return result[0];
}

/**
 * Insert multiple high-cost claimants (bulk insert)
 */
export async function insertManyHighCostClaimants(records: InsertHighCostClaimantParams[]) {
  const result = await sql`
    INSERT INTO high_cost_claimants ${sql(records)}
    RETURNING *
  `;
  return result;
}

/**
 * Get all high-cost claimants for a user
 */
export async function getHighCostClaimants(userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM high_cost_claimants
      ORDER BY total_paid_amount DESC
    `;
  }

  return await sql`
    SELECT * FROM high_cost_claimants
    WHERE user_id = ${userId}
    ORDER BY total_paid_amount DESC
  `;
}

/**
 * Get top N high-cost claimants
 */
export async function getTopHighCostClaimants(limit = 10, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM high_cost_claimants
      ORDER BY total_paid_amount DESC
      LIMIT ${limit}
    `;
  }

  return await sql`
    SELECT * FROM high_cost_claimants
    WHERE user_id = ${userId}
    ORDER BY total_paid_amount DESC
    LIMIT ${limit}
  `;
}

/**
 * Get high-cost claimants by diagnosis code
 */
export async function getClaimantsByDiagnosis(diagnosisCode: string, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM high_cost_claimants
      WHERE primary_diagnosis_code = ${diagnosisCode}
      ORDER BY total_paid_amount DESC
    `;
  }

  return await sql`
    SELECT * FROM high_cost_claimants
    WHERE primary_diagnosis_code = ${diagnosisCode} AND user_id = ${userId}
    ORDER BY total_paid_amount DESC
  `;
}

/**
 * Get high-cost claimants by member ID
 */
export async function getClaimantsByMemberId(memberId: string, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM high_cost_claimants
      WHERE member_id = ${memberId}
      ORDER BY total_paid_amount DESC
    `;
  }

  return await sql`
    SELECT * FROM high_cost_claimants
    WHERE member_id = ${memberId} AND user_id = ${userId}
    ORDER BY total_paid_amount DESC
  `;
}

/**
 * Get diagnosis breakdown (aggregated by diagnosis)
 */
export async function getDiagnosisBreakdown(userId?: string) {
  if (!userId) {
    return await sql`
      SELECT
        primary_diagnosis_code AS diagnosis_code,
        primary_diagnosis_description AS diagnosis_description,
        SUM(total_paid_amount) AS total_cost,
        SUM(claim_count) AS claim_count,
        COUNT(DISTINCT member_id) AS member_count,
        AVG(total_paid_amount / NULLIF(claim_count, 0)) AS avg_cost_per_claim
      FROM high_cost_claimants
      GROUP BY primary_diagnosis_code, primary_diagnosis_description
      ORDER BY total_cost DESC
    `;
  }

  return await sql`
    SELECT
      primary_diagnosis_code AS diagnosis_code,
      primary_diagnosis_description AS diagnosis_description,
      SUM(total_paid_amount) AS total_cost,
      SUM(claim_count) AS claim_count,
      COUNT(DISTINCT member_id) AS member_count,
      AVG(total_paid_amount / NULLIF(claim_count, 0)) AS avg_cost_per_claim
    FROM high_cost_claimants
    WHERE user_id = ${userId}
    GROUP BY primary_diagnosis_code, primary_diagnosis_description
    ORDER BY total_cost DESC
  `;
}

/**
 * Get claimants with total cost above threshold
 */
export async function getClaimantsAboveThreshold(threshold: number, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM high_cost_claimants
      WHERE total_paid_amount > ${threshold}
      ORDER BY total_paid_amount DESC
    `;
  }

  return await sql`
    SELECT * FROM high_cost_claimants
    WHERE total_paid_amount > ${threshold} AND user_id = ${userId}
    ORDER BY total_paid_amount DESC
  `;
}

/**
 * Get claimants statistics
 */
export async function getClaimantsStats(userId?: string) {
  if (!userId) {
    return await sql`
      SELECT
        COUNT(*) AS total_claimants,
        SUM(total_paid_amount) AS total_cost,
        AVG(total_paid_amount) AS avg_cost,
        MAX(total_paid_amount) AS max_cost,
        MIN(total_paid_amount) AS min_cost,
        SUM(claim_count) AS total_claims,
        AVG(risk_score) AS avg_risk_score
      FROM high_cost_claimants
    `;
  }

  const result = await sql`
    SELECT
      COUNT(*) AS total_claimants,
      SUM(total_paid_amount) AS total_cost,
      AVG(total_paid_amount) AS avg_cost,
      MAX(total_paid_amount) AS max_cost,
      MIN(total_paid_amount) AS min_cost,
      SUM(claim_count) AS total_claims,
      AVG(risk_score) AS avg_risk_score
    FROM high_cost_claimants
    WHERE user_id = ${userId}
  `;

  return result[0];
}

/**
 * Update high-cost claimant
 */
export async function updateHighCostClaimant(id: string, data: Partial<InsertHighCostClaimantParams>) {
  const result = await sql`
    UPDATE high_cost_claimants
    SET ${sql(data)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete high-cost claimant by ID
 */
export async function deleteHighCostClaimant(id: string) {
  const result = await sql`
    DELETE FROM high_cost_claimants
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete all high-cost claimants for a user
 */
export async function deleteAllHighCostClaimants(userId?: string) {
  if (!userId) {
    return await sql`DELETE FROM high_cost_claimants RETURNING *`;
  }

  return await sql`
    DELETE FROM high_cost_claimants
    WHERE user_id = ${userId}
    RETURNING *
  `;
}
