import pool from "../config/database/postgresql.ts";

/**
 * Fetch all subscription plans sorted by ID (ascending order)
 */
export const findAllPlans = async () => {
  const { rows } = await pool.query(
    `
    SELECT * FROM subscription_plans 
    ORDER BY id ASC
    `
  );

  return rows;
};

/**
 * Find a single subscription plan by its numeric ID
 */
export const findPlanById = async (id: number) => {
  const { rows } = await pool.query(
    "SELECT * FROM subscription_plans WHERE id = $1",
    [id]
  );

  return rows[0] ?? null;
};

/**
 * Find a subscription plan by its unique string name (case-insensitive)
 */
export const findPlanByName = async (name: string) => {
  const { rows } = await pool.query(
    `
    SELECT * FROM subscription_plans 
    WHERE UPPER(name) = $1
    LIMIT 1
    `,
    [name.toUpperCase()]
  );

  return rows[0] ?? null;
};