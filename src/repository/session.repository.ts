import pool from "../config/database/postgresql.ts";
export const createSession = async (data: any) => {
  const {
    userId,
    tokenHash,
    device,
    ip,
    userAgent,
  } = data;

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ); // 30 days

  //console.log(expiresAt);

  await pool.query(
    `
    INSERT INTO user_sessions (
      user_id,
      refresh_token_hash,
      device,
      ip_address,
      user_agent,
      expires_at
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [
      userId,
      tokenHash,
      device,
      ip,
      userAgent,
      expiresAt,
    ]
  );
};

export const findSessionByToken = async (hash: string) => {
  const { rows } = await pool.query(
    "SELECT * FROM user_sessions WHERE refresh_token_hash = $1",
    [hash]
  );
  return rows[0];
};

export const deactivateSession = async (id: number) => {
  await pool.query(
    "UPDATE user_sessions SET is_active = false WHERE id = $1",
    [id]
  );
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
     WHERE user_id = $1 AND is_active = true
     ORDER BY created_at ASC`,
    [userId]
  );
  return rows;
};