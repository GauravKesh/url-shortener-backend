import pool from "../config/database/postgresql.ts";

// ─── Whitelisted fields for safe dynamic updates ───────────────────────────
const ALLOWED_UPDATE_FIELDS: ReadonlySet<string> = new Set([
  "original_url",
  "short_code",
  "domain_id",
  "expires_at",
]);

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UrlRow {
  id: number;
  short_code: string;
  original_url: string;
  user_id: number;
  organization_id: number;
  domain_id: number | null;
  expires_at: Date | null;
  clicks: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUrlData {
  shortCode: string;
  originalUrl: string;
  userId: number;
  organizationId: number;
  domainId?: number | null;
  expiresAt?: Date | null;
}

export interface GetUrlsOptions {
  userId?: number;
  organizationId?: number;
  /**
   * AND  → user_id AND organization_id must both match (safe, scoped)
   * OR   → either matches (use carefully — cross-org leakage risk if not gated upstream)
   */
  mode?: "OR" | "AND";
  limit?: number;
  offset?: number;
}

// ─── Create ────────────────────────────────────────────────────────────────

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

// ─── Read ──────────────────────────────────────────────────────────────────

/** Primary redirect look-up by short code. */
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

export const findUrlById = async (id: number): Promise<UrlRow | null> => {
  const { rows } = await pool.query<UrlRow>(
    `SELECT * FROM urls
     WHERE id = $1
       AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
};

/** Multi-tenant-safe fetch — scoped to org. */
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

/** Domain + short-code composite look-up (custom domains). */
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

// ─── Short-code uniqueness ─────────────────────────────────────────────────

/**
 * Checks whether the short code is already in use — including soft-deleted
 * rows, so a recycled code can never silently conflict.
 */
export const isShortCodeTaken = async (shortCode: string): Promise<boolean> => {
  const { rows } = await pool.query(
    `SELECT 1 FROM urls WHERE short_code = $1 LIMIT 1`,
    [shortCode]
  );
  return rows.length > 0;
};

// ─── List / Paginate ───────────────────────────────────────────────────────

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

export const countUrlsByOrg = async (organizationId: number): Promise<number> => {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM urls
     WHERE organization_id = $1
       AND deleted_at IS NULL`,
    [organizationId]
  );
  return Number(rows[0].count);
};

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

export const countUrlsByUser = async (userId: number): Promise<number> => {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM urls
     WHERE user_id = $1
       AND deleted_at IS NULL`,
    [userId]
  );
  return Number(rows[0].count);
};

/**
 * Flexible list query.
 *
 * ⚠️  Use mode "OR" only when you have already verified that the calling user
 *     belongs to the supplied organizationId, otherwise org-level rows are
 *     accessible to any authenticated user who guesses an org id.
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
    const uIdx = values.length - 1; // $1
    const oIdx = values.length;     // $2
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

// ─── Update ────────────────────────────────────────────────────────────────

/**
 * Safe dynamic update — only whitelisted columns are accepted.
 * Keys not in ALLOWED_UPDATE_FIELDS are silently dropped.
 */
export const updateUrl = async (
  id: number,
  updates: Partial<Record<typeof ALLOWED_UPDATE_FIELDS extends Set<infer K> ? K : never, unknown>>
): Promise<UrlRow | null> => {
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => ALLOWED_UPDATE_FIELDS.has(key))
  );

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

// ─── Delete ────────────────────────────────────────────────────────────────

/** Soft delete — org-scoped to prevent cross-tenant deletion. */
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

/**
 * Hard delete — admin/debug only.
 * Caller must enforce authorization before invoking this.
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

// ─── Clicks ────────────────────────────────────────────────────────────────

/** Fire-and-forget click increment (redirects, best-effort). */
export const incrementClicks = async (id: number): Promise<void> => {
  await pool.query(
    `UPDATE urls SET clicks = clicks + 1 WHERE id = $1`,
    [id]
  );
};

/** Atomic increment — returns the new click count. */
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

// ─── Expiration ────────────────────────────────────────────────────────────

/** Returns true if the URL exists and its expiry has passed. */
export const isUrlExpired = async (shortCode: string): Promise<boolean> => {
  const { rows } = await pool.query<{ expires_at: Date | null }>(
    `SELECT expires_at FROM urls WHERE short_code = $1 AND deleted_at IS NULL`,
    [shortCode]
  );
  if (!rows[0]?.expires_at) return false;
  return new Date(rows[0].expires_at) < new Date();
};