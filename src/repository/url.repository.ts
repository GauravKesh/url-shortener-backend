import pool from "../config/database/postgresql.ts";

import type {
  UrlRow,
  CreateUrlData,
  GetUrlsOptions,
} from "../types/url.ts";

import {
  ALLOWED_UPDATE_SET,
  type AllowedUpdateField,
} from "../constants/url.ts";

/*
  Create a new short URL entry
*/
export const createUrl = async (data: CreateUrlData): Promise<UrlRow> => {
  const {
    shortCode,
    originalUrl,
    userId,
    organizationId,
    domainId = null,
    expiresAt = null,
  } = data;

  const { rows } = await pool.query<UrlRow>(
    `INSERT INTO urls
       (short_code, original_url, user_id, organization_id, domain_id, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [shortCode, originalUrl, userId, organizationId, domainId, expiresAt]
  );

  return rows[0];
};

/*
  Fetch URL by shortCode (used for redirect)
*/
export const findUrl = async (shortCode: string): Promise<UrlRow | null> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE short_code = $1
       AND deleted_at IS NULL
     LIMIT 1`,
    [shortCode]
  );
  return rows[0] ?? null;
};

/*
  Fetch URL by ID (global lookup)
*/
export const findUrlById = async (id: number): Promise<UrlRow | null> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE id = $1
       AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
};

/*
  Fetch URL scoped to organization (multi-tenant safety)
*/
export const findUrlByIdAndOrg = async (
  id: number,
  organizationId: number
): Promise<UrlRow | null> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE id = $1
       AND organization_id = $2
       AND deleted_at IS NULL`,
    [id, organizationId]
  );
  return rows[0] ?? null;
};

/*
  Fetch URL scoped to user
*/
export const findUrlByIdAndUser = async (
  id: number,
  userId: number
): Promise<UrlRow | null> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE id = $1
       AND user_id = $2
       AND deleted_at IS NULL`,
    [id, userId]
  );
  return rows[0] ?? null;
};

/*
  Fetch URL by domain + shortCode (custom domain support)
*/
export const findByDomainAndCode = async (
  domainId: number,
  shortCode: string
): Promise<UrlRow | null> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE domain_id = $1
       AND short_code = $2
       AND deleted_at IS NULL`,
    [domainId, shortCode]
  );
  return rows[0] ?? null;
};

/*
  Check if shortCode already exists
*/
export const isShortCodeTaken = async (shortCode: string): Promise<boolean> => {
  const { rows } = await pool.query(
    `SELECT 1 FROM urls WHERE short_code = $1 LIMIT 1`,
    [shortCode]
  );
  return rows.length > 0;
};

/*
  Get paginated URLs for organization
*/
export const getUrlsByOrg = async ({
  organizationId,
  limit = 10,
  offset = 0,
}: {
  organizationId: number;
  limit?: number;
  offset?: number;
}): Promise<UrlRow[]> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE organization_id = $1
       AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [organizationId, limit, offset]
  );
  return rows;
};

/*
  Count URLs for organization (pagination support)
*/
export const countUrlsByOrg = async (organizationId: number): Promise<number> => {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM urls
     WHERE organization_id = $1
       AND deleted_at IS NULL`,
    [organizationId]
  );
  return Number(rows[0].count);
};

/*
  Get paginated URLs for user
*/
export const getUrlsByUser = async ({
  userId,
  limit = 10,
  offset = 0,
}: {
  userId: number;
  limit?: number;
  offset?: number;
}): Promise<UrlRow[]> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE user_id = $1
       AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

/*
  Count URLs for user
*/
export const countUrlsByUser = async (userId: number): Promise<number> => {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM urls
     WHERE user_id = $1
       AND deleted_at IS NULL`,
    [userId]
  );
  return Number(rows[0].count);
};

/*
  Flexible fetch (user + org with AND/OR mode)
*/
export const getUrls = async ({
  userId,
  organizationId,
  mode = "OR",
  limit = 10,
  offset = 0,
}: GetUrlsOptions): Promise<UrlRow[]> => {
  const conditions: string[] = ["deleted_at IS NULL"];
  const values: unknown[] = [];

  if (userId !== undefined && organizationId !== undefined) {
    values.push(userId, organizationId);
    const uIdx = values.length - 1;
    const oIdx = values.length;
    const op = mode === "AND" ? "AND" : "OR";
    conditions.push(`(user_id = $${uIdx} ${op} organization_id = $${oIdx})`);
  } else if (userId !== undefined) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  } else if (organizationId !== undefined) {
    values.push(organizationId);
    conditions.push(`organization_id = $${values.length}`);
  }

  values.push(limit, offset);

  const query = `
    SELECT * FROM urls
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
  `;

  const { rows } = await pool.query<UrlRow>(query, values);
  return rows;
};

/*
  Update URL (only whitelisted fields allowed)
*/
export const updateUrl = async (
  id: number,
  updates: Record<string, unknown>
): Promise<UrlRow | null> => {
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) =>
      ALLOWED_UPDATE_SET.has(key as AllowedUpdateField)
    )
  ) as Partial<Record<AllowedUpdateField, unknown>>;

  const keys = Object.keys(safeUpdates);
  if (keys.length === 0) return null;

  const values = Object.values(safeUpdates);
  const setQuery = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const { rows } = await pool.query<UrlRow>(
    `UPDATE urls
     SET ${setQuery}, updated_at = NOW()
     WHERE id = $${keys.length + 1}
       AND deleted_at IS NULL
     RETURNING *`,
    [...values, id]
  );

  return rows[0] ?? null;
};

/*
  Soft delete URL (organization scoped)
*/
export const deleteUrl = async (
  id: number,
  organizationId: number
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `UPDATE urls
     SET deleted_at = NOW()
     WHERE id = $1
       AND organization_id = $2
       AND deleted_at IS NULL`,
    [id, organizationId]
  );
  return (rowCount ?? 0) > 0;
};

/*
  Hard delete URL (permanent removal)
*/
export const hardDeleteUrl = async (
  id: number,
  organizationId: number
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM urls
     WHERE id = $1
       AND organization_id = $2`,
    [id, organizationId]
  );
  return (rowCount ?? 0) > 0;
};

/*
  Increment click count
*/
export const incrementClicks = async (id: number): Promise<void> => {
  await pool.query(
    `UPDATE urls SET clicks = clicks + 1 WHERE id = $1`,
    [id]
  );
};

/*
  Increment clicks and return updated count
*/
export const incrementClicksAndGet = async (
  id: number
): Promise<number | null> => {
  const { rows } = await pool.query<{ clicks: number }>(
    `UPDATE urls
     SET clicks = clicks + 1
     WHERE id = $1
     RETURNING clicks`,
    [id]
  );
  return rows[0]?.clicks ?? null;
};

/*
  Check if URL is expired
*/
export const isUrlExpired = async (shortCode: string): Promise<boolean> => {
  const { rows } = await pool.query<{ expires_at: Date | null }>(
    `SELECT expires_at FROM urls WHERE short_code = $1 AND deleted_at IS NULL`,
    [shortCode]
  );
  if (!rows[0]?.expires_at) return false;
  return new Date(rows[0].expires_at) < new Date();
};