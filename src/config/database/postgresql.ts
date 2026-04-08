import pkg from "pg";
import config from "../config.ts";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.db.postgresUrl
});

export default pool;