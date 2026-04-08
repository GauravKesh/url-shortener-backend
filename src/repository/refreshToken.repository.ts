import pool from "../config/database/postgresql.ts";

export const storeRefreshToken = async (
  userId: number,
  token: string
) => {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash) VALUES ($1, $2)",
    [userId, token]
  );
};

export const findRefreshToken = async (token: string) => {
  const { rows } = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token_hash = $1",
    [token]
  );
  return rows[0];
};

export const deleteRefreshToken = async (token: string) => {
  await pool.query(
    "DELETE FROM refresh_tokens WHERE token_hash = $1",
    [token]
  );
};