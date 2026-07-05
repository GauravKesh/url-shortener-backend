import pool from "../config/database/postgresql.ts";

export const findDomainByDomainId = async (
  domainId: string,
  organizationId?: number
) => {
  const values: unknown[] = [domainId];
  let organizationClause = "";

  if (organizationId !== undefined) {
    values.push(organizationId);
    organizationClause = ` AND organization_id = $2`;
  }

  const { rows } = await pool.query(
    `SELECT * FROM domains
     WHERE domain_id = $1${organizationClause}`,
    values
  );

  return rows[0] ?? null;
};