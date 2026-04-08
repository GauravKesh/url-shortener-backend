import pool from "../config/database/postgresql.ts";

export const createOrganization = async (name: string, ownerId: number) => {
  const { rows } = await pool.query(
    `INSERT INTO organizations (name, owner_id)
     VALUES ($1, $2)
     RETURNING *`,
    [name, ownerId]
  );
  return rows[0];
};

export const findOrgById = async (id: number) => {
  const { rows } = await pool.query(
    "SELECT * FROM organizations WHERE id = $1",
    [id]
  );
  return rows[0];
};

export const findOrgByUser = async (userId: number) => {
  const { rows } = await pool.query(
    "SELECT * FROM organizations WHERE owner_id = $1",
    [userId]
  );
  return rows[0];
};

export const updateOrganization = async (id: number, updates: any) => {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const query = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

  const { rows } = await pool.query(
    `UPDATE organizations SET ${query} WHERE id = $${keys.length + 1}
     RETURNING *`,
    [...values, id]
  );

  return rows[0];
};

export const deleteOrganization = async (id: number) => {
  await pool.query(
    "DELETE FROM organizations WHERE id = $1",
    [id]
  );
};