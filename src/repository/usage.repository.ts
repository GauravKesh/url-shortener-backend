import pool from "../config/database/postgresql.ts";

export const getUsage = async (orgId: number, start: Date) => {
  const { rows } = await pool.query(
    `SELECT * FROM usage_tracking 
     WHERE organization_id = $1 AND period_start = $2`,
    [orgId, start]
  );
  return rows[0];
};

export const createUsage = async (orgId: number, start: Date, end: Date) => {
  const { rows } = await pool.query(
    `INSERT INTO usage_tracking 
     (organization_id, period_start, period_end)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [orgId, start, end]
  );
  return rows[0];
};

export const incrementUsage = async (
  orgId: number,
  field: string,
  start: Date
) => {
  await pool.query(
    `UPDATE usage_tracking 
     SET ${field} = ${field} + 1 
     WHERE organization_id = $1 AND period_start = $2`,
    [orgId, start]
  );
};