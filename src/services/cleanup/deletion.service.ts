import pool from "../../config/database/postgresql.ts";
import logger from "../../config/log/logger.ts";

const RETENTION_DAYS = 30;

export const scheduleUserDeletion = async (userId: number) => {
  await pool.query("UPDATE users SET deletion_requested_at = NOW() WHERE id = $1", [userId]);
};

export const cancelUserDeletion = async (userId: number) => {
  await pool.query("UPDATE users SET deletion_requested_at = NULL WHERE id = $1", [userId]);
};

export const scheduleOrganizationDeletion = async (organizationId: string) => {
  await pool.query(
    "UPDATE organizations SET deletion_requested_at = NOW(), updated_at = NOW() WHERE organization_id = $1",
    [organizationId]
  );
};

export const cancelOrganizationDeletion = async (organizationId: string) => {
  await pool.query(
    "UPDATE organizations SET deletion_requested_at = NULL, updated_at = NOW() WHERE organization_id = $1",
    [organizationId]
  );
};

export const processPendingDeletions = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userThresholdSql = `SELECT id FROM users WHERE deletion_requested_at IS NOT NULL AND deletion_requested_at <= NOW() - INTERVAL '${RETENTION_DAYS} days'`;
    const { rows: usersToDelete } = await client.query(userThresholdSql);

    for (const r of usersToDelete) {
      const userId = r.id;
      // Double-check last_login_at: if user logged in after request, skip
      const { rows } = await client.query(
        `SELECT deletion_requested_at, last_login_at FROM users WHERE id = $1`,
        [userId]
      );
      const dr = rows[0]?.deletion_requested_at;
      const lastLogin = rows[0]?.last_login_at;
      if (lastLogin && new Date(lastLogin) > new Date(dr)) {
        // user re-activated, cancel deletion
        await client.query("UPDATE users SET deletion_requested_at = NULL WHERE id = $1", [userId]);
        continue;
      }

      // Permanently delete the user (cascades will remove sessions, urls etc)
      await client.query("DELETE FROM users WHERE id = $1", [userId]);
      logger.info(`Permanently deleted user ${userId}`);
    }

    const orgThresholdSql = `SELECT id, organization_id, owner_id FROM organizations WHERE deletion_requested_at IS NOT NULL AND deletion_requested_at <= NOW() - INTERVAL '${RETENTION_DAYS} days'`;
    const { rows: orgsToDelete } = await client.query(orgThresholdSql);

    for (const org of orgsToDelete) {
      const orgId = org.organization_id;
      const ownerId = org.owner_id;

      // If owner logged in after deletion request, cancel
      const { rows } = await client.query(
        `SELECT deletion_requested_at FROM organizations WHERE organization_id = $1`,
        [orgId]
      );
      const dr = rows[0]?.deletion_requested_at;

      // check owner last login
      const { rows: ownerRows } = await client.query(`SELECT last_login_at FROM users WHERE id = $1`, [ownerId]);
      const ownerLastLogin = ownerRows[0]?.last_login_at;
      if (ownerLastLogin && new Date(ownerLastLogin) > new Date(dr)) {
        await client.query("UPDATE organizations SET deletion_requested_at = NULL WHERE organization_id = $1", [orgId]);
        continue;
      }

      // Permanently delete organization — cascading FKs handle related tables
      await client.query("DELETE FROM organizations WHERE organization_id = $1", [orgId]);
      logger.info(`Permanently deleted organization ${orgId}`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("Error processing pending deletions", err);
    throw err;
  } finally {
    client.release();
  }
};

export default {
  scheduleUserDeletion,
  cancelUserDeletion,
  scheduleOrganizationDeletion,
  cancelOrganizationDeletion,
  processPendingDeletions,
};
