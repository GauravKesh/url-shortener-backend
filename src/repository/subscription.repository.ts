import pool from "../config/database/postgresql.ts";
// CREATE SUBSCRIPTION
export const createSubscription = async (
  organizationId: number,
  planId: number,
  startDate: Date,
  endDate: Date | null
) => {
  const { rows } = await pool.query(
    `INSERT INTO subscriptions 
    (organization_id, plan_id, start_date, end_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [organizationId, planId, startDate, endDate]
  );

  return rows[0];
};

// GET ACTIVE SUBSCRIPTION
export const getActiveSubscription = async (orgId: number) => {
  const { rows } = await pool.query(
    `SELECT s.*, p.*
     FROM subscriptions s
     JOIN subscription_plans p ON s.plan_id = p.id
     WHERE s.organization_id = $1 
     AND s.status = 'ACTIVE'
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [orgId]
  );
  

  return rows[0];
};

// GET BY ID
export const getSubscriptionById = async (id: number) => {
  const { rows } = await pool.query(
    "SELECT * FROM subscriptions WHERE id = $1",
    [id]
  );
  return rows[0];
};

// UPDATE (upgrade/downgrade)
export const updateSubscription = async (
  id: number,
  updates: any
) => {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const query = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

  const { rows } = await pool.query(
    `UPDATE subscriptions 
     SET ${query} 
     WHERE id = $${keys.length + 1}
     RETURNING *`,
    [...values, id]
  );

  return rows[0];
};

// DEACTIVATE OLD SUBSCRIPTION
export const deactivateSubscriptions = async (orgId: number) => {
  await pool.query(
    `UPDATE subscriptions 
     SET status = 'INACTIVE'
     WHERE organization_id = $1`,
    [orgId]
  );
};

