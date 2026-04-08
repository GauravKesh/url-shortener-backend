import fs from "fs";
import path from "path";
import pool from "../config/database/postgresql.ts";
const runMigrations = async () => {
  const files = fs.readdirSync("./migrations").sort();

  for (const file of files) {
    const sql = fs.readFileSync(
      path.join("./migrations", file),
      "utf-8"
    );

    console.log(`Running: ${file}`);
    await pool.query(sql);
  }

  console.log("✅ All migrations applied");
  process.exit(0);
};

runMigrations();