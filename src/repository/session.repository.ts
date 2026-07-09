import pool from "../config/database/postgresql.ts";

export const createSession = async (data: any) => {
  const {
    userId,
    tokenHash,
    device,
    ip,
    userAgent,
    expiresAt: providedExpiresAt,
  } = data;

  const expiresAt = providedExpiresAt
    ? new Date(providedExpiresAt)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const lastUsedAt = new Date();

  const { rows } = await pool.query(
    `
    INSERT INTO user_sessions (
      user_id,
      refresh_token_hash,
      device,
      ip_address,
      user_agent,
      expires_at,
      last_used_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
    `,
    [
      userId,
      tokenHash,
      device,
      ip,
      userAgent,
      expiresAt,
      lastUsedAt,
    ]
  );

  return rows[0];
};

export const findSessionByToken = async (hash: string) => {
  const { rows } = await pool.query(
    "SELECT * FROM user_sessions WHERE refresh_token_hash = $1",
    [hash]
  );
  return rows[0];
};

export const findSessionById = async (id: number) => {
  const { rows } = await pool.query(
    "SELECT * FROM user_sessions WHERE id = $1",
    [id]
  );
  return rows[0];
};

export const deactivateSession = async (id: number) => {
  await pool.query(
    `UPDATE user_sessions
     SET is_active = false,
         expires_at = NOW()
     WHERE id = $1`,
    [id]
  );
};

export const invalidateSessionByHash = async (hash: string) => {
  await pool.query(
    `UPDATE user_sessions
     SET is_active = false,
         expires_at = NOW()
     WHERE refresh_token_hash = $1`,
    [hash]
  );
};

export const invalidateSessionsByUser = async (
  userId: number,
  excludeHash?: string
) => {
  const values: any[] = [userId];
  let query = `UPDATE user_sessions
     SET is_active = false,
         expires_at = NOW()
     WHERE user_id = $1`;

  if (excludeHash) {
    query += ` AND refresh_token_hash != $2`;
    values.push(excludeHash);
  }

  await pool.query(query, values);
};

export const updateSessionById = async (
  id: number,
  updates: { expires_at?: Date; is_active?: boolean; last_used_at?: Date }
) => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (updates.expires_at !== undefined) {
    fields.push(`expires_at = $${index++}`);
    values.push(updates.expires_at);
  }

  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${index++}`);
    values.push(updates.is_active);
  }

  if (updates.last_used_at !== undefined) {
    fields.push(`last_used_at = $${index++}`);
    values.push(updates.last_used_at);
  }

  if (fields.length === 0) {
    return findSessionById(id);
  }

  values.push(id);

  const { rows } = await pool.query(
    `UPDATE user_sessions SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
    values
  );
  return rows[0];
};

export const deleteSession = async (hash: string) => {
  await pool.query(
    "DELETE FROM user_sessions WHERE refresh_token_hash = $1",
    [hash]
  );
};

export const getActiveSessions = async (userId: number) => {
  const { rows } = await pool.query(
    `SELECT * FROM user_sessions
     WHERE user_id = $1
       AND is_active = true
       AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

export const getSessionsByUserTerminated = async (
  userId: number,
  status: "active" | "inactive" | "all" = "all"
) => {
  let query = `SELECT * FROM user_sessions WHERE user_id = $1`;

  if (status === "active") {
    query += " AND is_active = true AND expires_at > NOW()";
  } else if (status === "inactive") {
    query += " AND (is_active = false OR expires_at <= NOW())";
  }

  query += " ORDER BY created_at DESC";

  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const getSessionsByUser = async (userId: number) => {
  const query = `
    SELECT * FROM user_sessions 
    WHERE user_id = $1 
      AND is_active = true 
      AND expires_at > NOW() 
    ORDER BY created_at DESC
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const getLoginActivityByUser = async (
  userId: number,
  opts: { limit?: number; offset?: number; since?: string } = {}
) => {
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const params: any[] = [userId];

  let query = `SELECT id, device, ip_address, user_agent, is_active, expires_at, last_used_at, created_at
               FROM user_sessions
               WHERE user_id = $1`;

  if (opts.since) {
    params.push(opts.since);
    query += ` AND created_at >= $${params.length}`;
  }

  params.push(limit);
  params.push(offset);

  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const deleteAllSessions = async () => {
  await pool.query("DELETE FROM user_sessions");
};