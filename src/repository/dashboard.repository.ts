import pool from "../config/database/postgresql.ts";

export const getUserDashboardStats = async (
  userId: number
) => {
  const { rows } = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total_urls,
      COALESCE(SUM(clicks),0)::int AS total_clicks
    FROM urls
    WHERE user_id = $1
      AND deleted_at IS NULL
    `,
    [userId]
  );

  return rows[0];
};

export const getOrgDashboardStats = async (
  organizationId: number
) => {
  const { rows } = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total_urls,
      COALESCE(SUM(clicks),0)::int AS total_clicks
    FROM urls
    WHERE organization_id = $1
      AND deleted_at IS NULL
    `,
    [organizationId]
  );

  return rows[0];
};

export const getRecentUrls = async (
  organizationId: number,
  limit = 10
) => {
  const { rows } = await pool.query(
    `
    SELECT
      urlid,
      short_code,
      original_url,
      clicks,
      created_at
    FROM urls
    WHERE organization_id = $1
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [organizationId, limit]
  );

  return rows;
};

export const getTopUrls = async (
  organizationId: number,
  limit = 5
) => {
  const { rows } = await pool.query(
    `
    SELECT
      urlid,
      short_code,
      original_url,
      clicks,
      created_at
    FROM urls
    WHERE organization_id = $1
      AND deleted_at IS NULL
    ORDER BY clicks DESC
    LIMIT $2
    `,
    [organizationId, limit]
  );

  return rows;
};