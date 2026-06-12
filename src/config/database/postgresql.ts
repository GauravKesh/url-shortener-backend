import fs from "fs";
import pkg from "pg";
import config from "../config.ts";
import logger from "../log/logger.ts";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.db.postgresUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          ca: fs.readFileSync(config.db.sslCa, "utf8"),
          rejectUnauthorized: true,
        }
      : false,
});

pool.on("connect", () => {
  logger.info("PostgreSQL connected");
});

pool.on("error", (err) => {
  logger.error(`PostgreSQL error: ${err.message}`);
});

export default pool;