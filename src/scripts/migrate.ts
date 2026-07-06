import fs from "fs";
import path from "path";
import crypto from "crypto";
import pool from "../config/database/postgresql.ts";
import logger from "../config/log/logger.ts";

async function runMigrations() {
  const migrationsDir = path.resolve(
    process.cwd(),
    "migrations",
    "sql"
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,

      version VARCHAR(50) NOT NULL UNIQUE,
      filename VARCHAR(255) NOT NULL UNIQUE,
      description TEXT NOT NULL,

      checksum TEXT NOT NULL,
      execution_time_ms INT,

      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const version = file.split("_")[0];

    const description = file
      .replace(".sql", "")
      .replace(/^\d+_/, "")
      .replace(/_/g, " ");

    const alreadyRun = await pool.query(
      `
      SELECT 1
      FROM schema_migrations
      WHERE version = $1
      `,
      [version]
    );

    if (alreadyRun.rowCount) {
      logger.info(`⏭ Skipping ${file}`);
      continue;
    }

    const sql = fs.readFileSync(
      path.join(migrationsDir, file),
      "utf8"
    );

    const checksum = crypto
      .createHash("sha256")
      .update(sql)
      .digest("hex");

    const start = Date.now();

    logger.info(`🚀 Running ${file}`);

    await pool.query("BEGIN");

    try {
      await pool.query(sql);

      const executionTime = Date.now() - start;

      await pool.query(
        `
        INSERT INTO schema_migrations (
          version,
          filename,
          description,
          checksum,
          execution_time_ms
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          version,
          file,
          description,
          checksum,
          executionTime,
        ]
      );

      await pool.query("COMMIT");

      //console.log(`✅ Applied ${file}`);
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }

  logger.info("🎉 All migrations complete");

  await pool.end();
  process.exit(0);
}

runMigrations().catch(async (error) => {
  logger.error("❌ Migration failed:", error);

  await pool.end();
  process.exit(1);
});