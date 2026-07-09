import pool from "../config/database/postgresql.ts";

export const findUserById = async (id: number) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  return rows[0];
};

export const findUserByEmail = async (email: string) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL",
    [email]
  );
  return rows[0];
};

export const createUser = async (email: string, password: string) => {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING *`,
    [email, password]
  );
  return rows[0];
};

export const updateUser = async (id: number, updates: any) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setQuery = fields
    .map((f, i) => `${f} = $${i + 1}`)
    .join(", ");

  const { rows } = await pool.query(
    `UPDATE users SET ${setQuery} WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id]
  );

  return rows[0];
};

export const deleteUser = async (id: number) => {
  await pool.query(
    "UPDATE users SET deletion_requested_at = NOW() WHERE id = $1",
    [id]
  );
};