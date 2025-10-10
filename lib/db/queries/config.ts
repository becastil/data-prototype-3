import sql from '../connection';

export interface InsertDashboardConfigParams {
  userId?: string;
  clientName: string;
  planYear: string;
  startDate: string;
  endDate: string;
  targetLossRatio: number;
  currency?: string;
  dateFormat?: string;
  isActive?: boolean;
}

/**
 * Insert a new dashboard configuration
 */
export async function insertDashboardConfig(data: InsertDashboardConfigParams) {
  const result = await sql`
    INSERT INTO dashboard_configs ${sql(data)}
    RETURNING *
  `;
  return result[0];
}

/**
 * Get all dashboard configs for a user
 */
export async function getDashboardConfigs(userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM dashboard_configs
      ORDER BY created_at DESC
    `;
  }

  return await sql`
    SELECT * FROM dashboard_configs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

/**
 * Get active dashboard config for a user
 */
export async function getActiveDashboardConfig(userId?: string) {
  if (!userId) {
    const result = await sql`
      SELECT * FROM dashboard_configs
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return result[0];
  }

  const result = await sql`
    SELECT * FROM dashboard_configs
    WHERE user_id = ${userId} AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return result[0];
}

/**
 * Get dashboard config by ID
 */
export async function getDashboardConfigById(id: string) {
  const result = await sql`
    SELECT * FROM dashboard_configs
    WHERE id = ${id}
    LIMIT 1
  `;
  return result[0];
}

/**
 * Update dashboard config
 */
export async function updateDashboardConfig(id: string, data: Partial<InsertDashboardConfigParams>) {
  const result = await sql`
    UPDATE dashboard_configs
    SET ${sql(data)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Set a config as active (and deactivate all others for the user)
 */
export async function setActiveDashboardConfig(id: string, userId?: string) {
  // First, deactivate all configs for this user
  if (userId) {
    await sql`
      UPDATE dashboard_configs
      SET is_active = false
      WHERE user_id = ${userId}
    `;
  } else {
    await sql`
      UPDATE dashboard_configs
      SET is_active = false
    `;
  }

  // Then activate the specified config
  const result = await sql`
    UPDATE dashboard_configs
    SET is_active = true
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete dashboard config
 */
export async function deleteDashboardConfig(id: string) {
  const result = await sql`
    DELETE FROM dashboard_configs
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Get or create default dashboard config for a user
 */
export async function getOrCreateDefaultConfig(userId?: string) {
  // Try to get active config first
  let config = await getActiveDashboardConfig(userId);

  if (!config) {
    // Create a default config
    const currentYear = new Date().getFullYear();
    config = await insertDashboardConfig({
      userId,
      clientName: 'Healthcare Client',
      planYear: currentYear.toString(),
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      targetLossRatio: 0.85,
      currency: 'USD',
      dateFormat: 'YYYY-MM',
      isActive: true
    });
  }

  return config;
}
