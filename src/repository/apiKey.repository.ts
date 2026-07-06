import pool from "../config/database/postgresql.ts";

// CREATE API KEY
export const createApiKey = async ({
  organizationId,
  keyHash,
  name,
  rateLimitPerMin,
  maxLinks,
  maxExpiryDays
}: {
  organizationId: number;
  keyHash: string;
  name?: string;
  rateLimitPerMin?: number;
  maxLinks?: number;
  maxExpiryDays?: number;
}) => {
  const { rows } = await pool.query(
    `INSERT INTO api_keys 
    (organization_id, key_hash, name, rate_limit_per_min, max_links, max_expiry_days)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      organizationId,
      keyHash,
      name,
      rateLimitPerMin || null,
      maxLinks || null,
      maxExpiryDays || null
    ]
  );

  return rows[0];
};


// FIND API KEY (for auth middleware)
export const findApiKeyByHash = async (keyHash: string) => {
  const { rows } = await pool.query(
    `SELECT * FROM api_keys 
     WHERE key_hash = $1 AND revoked = false`,
    [keyHash]
  );

  return rows[0];
};


export const findApiKeyByApiKeyId = async (
  apiKeyId: string,
  organizationId: number
) => {
  const { rows } = await pool.query(
    `SELECT * FROM api_keys 
     WHERE api_key_id = $1 AND organization_id = $2`,
    [apiKeyId, organizationId]
  );

  return rows[0];
};


// GET ALL KEYS FOR ORG
export const getApiKeysByOrg = async (
  orgId: number,
  limit = 10,
  offset = 0
) => {
  const { rows } = await pool.query(
    `SELECT * FROM api_keys 
     WHERE organization_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [orgId, limit, offset]
  );

  return rows;
};


// UPDATE API KEY (limits / name)
export const updateApiKey = async (
  id: number,
  organizationId: number,
  updates: any
) => {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  if (!keys.length) return null;

  const query = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

  const { rows } = await pool.query(
    `UPDATE api_keys 
     SET ${query} 
     WHERE id = $${keys.length + 1}
     AND organization_id = $${keys.length + 2}
     RETURNING *`,
    [...values, id, organizationId]
  );

  return rows[0]; // undefined if not owner
};


export const updateApiKeyByApiKeyId = async (
  apiKeyId: string,
  organizationId: number,
  updates: any
) => {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  if (!keys.length) return null;

  const query = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

  const { rows } = await pool.query(
    `UPDATE api_keys 
     SET ${query} 
     WHERE api_key_id = $${keys.length + 1}
     AND organization_id = $${keys.length + 2}
     RETURNING *`,
    [...values, apiKeyId, organizationId]
  );

  return rows[0];
};


// REVOKE API KEY
export const revokeApiKey = async (
  id: number,
  organizationId: number
) => {
  const { rowCount } = await pool.query(
    `UPDATE api_keys 
     SET revoked = true 
     WHERE id = $1 AND organization_id = $2`,
    [id, organizationId]
  );

  return rowCount; // 0 = not owner / not found
};


export const revokeApiKeyByApiKeyId = async (
  apiKeyId: string,
  organizationId: number
) => {
  const { rowCount } = await pool.query(
    `UPDATE api_keys 
     SET revoked = true 
     WHERE api_key_id = $1 AND organization_id = $2`,
    [apiKeyId, organizationId]
  );

  return rowCount;
};


// DELETE API KEY (optional hard delete)
export const deleteApiKey = async (
  id: number,
  organizationId: number
) => {
  const { rowCount } = await pool.query(
    `DELETE FROM api_keys 
     WHERE id = $1 AND organization_id = $2`,
    [id, organizationId]
  );

  return rowCount;
};


export const deleteApiKeyByApiKeyId = async (
  apiKeyId: string,
  organizationId: number
) => {
  const { rowCount } = await pool.query(
    `DELETE FROM api_keys 
     WHERE api_key_id = $1 AND organization_id = $2`,
    [apiKeyId, organizationId]
  );

  return rowCount;
};


// UPDATE LAST USED
export const updateLastUsed = async (id: number) => {
  await pool.query(
    `UPDATE api_keys 
     SET last_used_at = NOW() 
     WHERE id = $1`,
    [id]
  );
};


// INCREMENT API KEY LINK COUNT 🌟
export const incrementApiKeyLinkCount = async (id: number) => {
  await pool.query(
    `UPDATE api_keys 
     SET links_created = links_created + 1,
         last_used_at = NOW() 
     WHERE id = $1`,
    [id]
  );
};