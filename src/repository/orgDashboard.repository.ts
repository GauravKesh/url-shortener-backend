import pool from "../config/database/postgresql.ts";

export const getDashboardCounters = async (orgId: number) => {
  const { rows } = await pool.query(
    `
    SELECT 
      COALESCE(COUNT(id), 0) AS total_links,
      COALESCE(SUM(clicks), 0) AS total_clicks
    FROM urls 
    WHERE organization_id = $1 AND deleted_at IS NULL
    `,
    [orgId]
  );
  return rows[0];
};

export const getTopPerformingLinks = async (orgId: number, limit = 5) => {
  const { rows } = await pool.query(
    `
    SELECT short_code, original_url, clicks, status, created_at
    FROM urls
    WHERE organization_id = $1 AND deleted_at IS NULL
    ORDER BY clicks DESC, created_at DESC
    LIMIT $2
    `,
    [orgId, limit]
  );
  return rows;
};

export const getRecentLinks = async (orgId: number, limit = 5) => {
  const { rows } = await pool.query(
    `
    SELECT short_code, original_url, clicks, status, created_at
    FROM urls
    WHERE organization_id = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [orgId, limit]
  );
  return rows;
};

export const getClickAnalyticsOverTime = async (orgId: number, days = 7) => {
  // Generates a daily series of clicks over the last X days for charts
  const { rows } = await pool.query(
    `
    SELECT 
      DATE(created_at) as click_date,
      COALESCE(SUM(clicks), 0) as click_count
    FROM urls
    WHERE organization_id = $1 
      AND deleted_at IS NULL 
      AND created_at >= NOW() - INTERVAL '1 day' * $2
    GROUP BY DATE(created_at)
    ORDER BY click_date ASC
    `,
    [orgId, days]
  );
  return rows;
};