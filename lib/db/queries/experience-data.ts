import sql from '../connection';
import type { ExperienceData } from '@/types/healthcare';

export interface InsertExperienceDataParams {
  userId?: string;
  month: string;
  domesticMedicalIP: number;
  domesticMedicalOP: number;
  nonDomesticMedical: number;
  prescriptionDrugs: number;
  dental: number;
  vision: number;
  mentalHealth: number;
  preventiveCare: number;
  emergencyRoom: number;
  urgentCare: number;
  specialtyCare: number;
  labDiagnostic: number;
  physicalTherapy: number;
  dme: number;
  homeHealth: number;
  enrollment: number;
}

/**
 * Insert a single experience data record
 */
export async function insertExperienceData(data: InsertExperienceDataParams) {
  const result = await sql`
    INSERT INTO experience_data ${sql(data)}
    RETURNING *
  `;
  return result[0];
}

/**
 * Insert multiple experience data records (bulk insert)
 */
export async function insertManyExperienceData(records: InsertExperienceDataParams[]) {
  const result = await sql`
    INSERT INTO experience_data ${sql(records)}
    RETURNING *
  `;
  return result;
}

/**
 * Get all experience data for a user
 */
export async function getExperienceData(userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM experience_data
      ORDER BY month ASC
    `;
  }

  return await sql`
    SELECT * FROM experience_data
    WHERE user_id = ${userId}
    ORDER BY month ASC
  `;
}

/**
 * Get experience data for a specific month
 */
export async function getExperienceDataByMonth(month: string, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM experience_data
      WHERE month = ${month}
      LIMIT 1
    `;
  }

  return await sql`
    SELECT * FROM experience_data
    WHERE month = ${month} AND user_id = ${userId}
    LIMIT 1
  `;
}

/**
 * Get experience data for a date range
 */
export async function getExperienceDataByDateRange(startMonth: string, endMonth: string, userId?: string) {
  if (!userId) {
    return await sql`
      SELECT * FROM experience_data
      WHERE month >= ${startMonth} AND month <= ${endMonth}
      ORDER BY month ASC
    `;
  }

  return await sql`
    SELECT * FROM experience_data
    WHERE month >= ${startMonth} AND month <= ${endMonth} AND user_id = ${userId}
    ORDER BY month ASC
  `;
}

/**
 * Update experience data for a specific month
 */
export async function updateExperienceData(id: string, data: Partial<InsertExperienceDataParams>) {
  const result = await sql`
    UPDATE experience_data
    SET ${sql(data)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete experience data by ID
 */
export async function deleteExperienceData(id: string) {
  const result = await sql`
    DELETE FROM experience_data
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

/**
 * Delete all experience data for a user
 */
export async function deleteAllExperienceData(userId?: string) {
  if (!userId) {
    return await sql`DELETE FROM experience_data RETURNING *`;
  }

  return await sql`
    DELETE FROM experience_data
    WHERE user_id = ${userId}
    RETURNING *
  `;
}

/**
 * Get total claims for a specific period
 */
export async function getTotalClaims(startMonth?: string, endMonth?: string, userId?: string) {
  const conditions: string[] = [];
  const params: string[] = [];

  if (userId) {
    conditions.push('user_id = $' + (params.length + 1));
    params.push(userId);
  }
  if (startMonth) {
    conditions.push('month >= $' + (params.length + 1));
    params.push(startMonth);
  }
  if (endMonth) {
    conditions.push('month <= $' + (params.length + 1));
    params.push(endMonth);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const result = await sql.unsafe(`
    SELECT
      SUM(domestic_medical_ip + domestic_medical_op + non_domestic_medical +
          prescription_drugs + dental + vision + mental_health + preventive_care +
          emergency_room + urgent_care + specialty_care + lab_diagnostic +
          physical_therapy + dme + home_health) AS total_claims,
      SUM(enrollment) AS total_enrollment
    FROM experience_data
    ${whereClause}
  `, params);

  return result[0];
}

/**
 * Upsert (insert or update on conflict)
 */
export async function upsertExperienceData(data: InsertExperienceDataParams) {
  const result = await sql`
    INSERT INTO experience_data ${sql(data)}
    ON CONFLICT (user_id, month)
    DO UPDATE SET
      domestic_medical_ip = EXCLUDED.domestic_medical_ip,
      domestic_medical_op = EXCLUDED.domestic_medical_op,
      non_domestic_medical = EXCLUDED.non_domestic_medical,
      prescription_drugs = EXCLUDED.prescription_drugs,
      dental = EXCLUDED.dental,
      vision = EXCLUDED.vision,
      mental_health = EXCLUDED.mental_health,
      preventive_care = EXCLUDED.preventive_care,
      emergency_room = EXCLUDED.emergency_room,
      urgent_care = EXCLUDED.urgent_care,
      specialty_care = EXCLUDED.specialty_care,
      lab_diagnostic = EXCLUDED.lab_diagnostic,
      physical_therapy = EXCLUDED.physical_therapy,
      dme = EXCLUDED.dme,
      home_health = EXCLUDED.home_health,
      enrollment = EXCLUDED.enrollment,
      updated_at = NOW()
    RETURNING *
  `;
  return result[0];
}
