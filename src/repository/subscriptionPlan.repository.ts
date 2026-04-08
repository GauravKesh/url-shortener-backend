import pool from "../config/database/postgresql.ts";
export const findPlanById = async (id: number) => {
  const { rows } = await pool.query(
    "SELECT * FROM subscription_plans WHERE id = $1",
    [id]
  );

  return rows[0];
};