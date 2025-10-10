import sql from '../connection';

export interface InsertFeeStructureParams {
  userId?: string;
  month: string;
  feeType: 'flat' | 'pepm' | 'pmpm' | 'tiered' | 'annual' | 'manual';
  amount: number;
  enrollment?: number;
  calculatedTotal: number;
  effectiveDate: string;
  description?: string;
}

/**
 * Insert a single fee structure
 */
export async function insertFeeStructure(data: InsertFeeStructureParams) {
  const result = await sql`
    INSERT INTO fee_structures ${sql(data)}
    RETURNING *
  `;
  return result[0];
}

/**
 * Insert multiple fee structures (bulk insert)
 */
export async function insertManyFeeStructures(records: InsertFeeStructureParams[]) {
  const result = await sql`
    INSERT INTO fee_structures ${sql(records)}
    RETURNING *
  `;
  return result;
}

/**
 * Get all fee structures for a user
 */
export async function getFeeStructures(userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM fee_structures
      ORDER BY month ASC
    `;
  }

  return await sql`
    SELECT * FROM fee_structures
    WHERE user_id = ${userId}
    ORDER BY month ASC
  `;
}

/**
 * Get fee structures for a specific month
 */
export async function getFeeStructuresByMonth(month: string, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM fee_structures
      WHERE month = ${month}
    `;
  }

  return await sql`
    SELECT * FROM fee_structures
    WHERE month = ${month} AND user_id = ${userId}
  `;
}

/**
 * Get fee structure by ID
 */
export async function getFeeStructureById(id: string) {
  const result = await sql`
    SELECT * FROM fee_structures
    WHERE id = ${id}
    LIMIT 1
  `;
  return result[0];
}

/**
 * Update fee structure
 */
export async function updateFeeStructure(id: string, data: Partial<InsertFeeStructureParams>) {
  const result = await sql`
    UPDATE fee_structures
    SET ${sql(data)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete fee structure by ID
 */
export async function deleteFeeStructure(id: string) {
  const result = await sql`
    DELETE FROM fee_structures
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete all fee structures for a user
 */
export async function deleteAllFeeStructures(userId?: string) {
  if (!userId) {
    return await sql`DELETE FROM fee_structures RETURNING *`;
  }

  return await sql`
    DELETE FROM fee_structures
    WHERE user_id = ${userId}
    RETURNING *
  `;
}

// ===== FEE STRUCTURES V2 =====

export interface InsertFeeStructureV2Params {
  userId?: string;
  name: string;
  feeType: 'flat' | 'pepm' | 'pmpm' | 'tiered' | 'annual' | 'percentage';
  baseAmount?: number;
  percentage?: number;
  tiers?: Record<string, unknown>; // JSONB field
  effectiveStartDate: string;
  effectiveEndDate?: string;
  isActive?: boolean;
  description?: string;
  metadata?: Record<string, unknown>; // JSONB field
}

/**
 * Insert a fee structure V2
 */
export async function insertFeeStructureV2(data: InsertFeeStructureV2Params) {
  const insertData = {
    ...data,
    tiers: data.tiers ? JSON.stringify(data.tiers) : null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  };

  const result = await sql`
    INSERT INTO fee_structures_v2 ${sql(insertData)}
    RETURNING *
  `;
  return result[0];
}

/**
 * Get all active fee structures V2 for a user
 */
export async function getFeeStructuresV2(userId?: string, activeOnly = true) {
  if (!userId) {
    if (activeOnly) {
      return await sql`
        SELECT * FROM fee_structures_v2
        WHERE is_active = true
        ORDER BY effective_start_date DESC
      `;
    }
    return await sql`
      SELECT * FROM fee_structures_v2
      ORDER BY effective_start_date DESC
    `;
  }

  if (activeOnly) {
    return await sql`
      SELECT * FROM fee_structures_v2
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY effective_start_date DESC
    `;
  }

  return await sql`
    SELECT * FROM fee_structures_v2
    WHERE user_id = ${userId}
    ORDER BY effective_start_date DESC
  `;
}

/**
 * Get fee structure V2 by ID
 */
export async function getFeeStructureV2ById(id: string) {
  const result = await sql`
    SELECT * FROM fee_structures_v2
    WHERE id = ${id}
    LIMIT 1
  `;
  return result[0];
}

/**
 * Update fee structure V2
 */
export async function updateFeeStructureV2(id: string, data: Partial<InsertFeeStructureV2Params>) {
  const updateData = {
    ...data,
    tiers: data.tiers ? JSON.stringify(data.tiers) : undefined,
    metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
  };

  const result = await sql`
    UPDATE fee_structures_v2
    SET ${sql(updateData)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete (deactivate) fee structure V2
 */
export async function deleteFeeStructureV2(id: string, hardDelete = false) {
  if (hardDelete) {
    const result = await sql`
      DELETE FROM fee_structures_v2
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  // Soft delete - just deactivate
  const result = await sql`
    UPDATE fee_structures_v2
    SET is_active = false
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}
