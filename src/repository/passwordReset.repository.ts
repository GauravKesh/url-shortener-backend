import pool from "../config/database/postgresql.ts";

export const createPasswordResetToken = async (
  userId: number,
  tokenHash: string,
  expiresAt: Date
) => {
  const { rows } = await pool.query(
    `INSERT INTO password_reset_tokens (
       user_id,
       token_hash,
       expires_at
     ) VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tokenHash, expiresAt]
  );

  return rows[0];
};

export const findPasswordResetTokenByHash = async (tokenHash: string) => {
  const { rows } = await pool.query(
    `SELECT * FROM password_reset_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  return rows[0];
};

export const markPasswordResetTokenUsed = async (tokenHash: string) => {
  const { rows } = await pool.query(
    `UPDATE password_reset_tokens
     SET is_used = true,
         used_at = NOW()
     WHERE token_hash = $1
     RETURNING *`,
    [tokenHash]
  );
  return rows[0];
};

export const invalidatePasswordResetTokensByUser = async (userId: number) => {
  await pool.query(
    `UPDATE password_reset_tokens
     SET is_used = true,
         used_at = NOW()
     WHERE user_id = $1`,
    [userId]
  );
};
