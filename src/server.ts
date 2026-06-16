import app from "./app.ts";
import redisClient from "./config/cache/redis.ts";
import config from "./config/config.ts";
import pool from "./config/database/postgresql.ts";
import { connectMongo, closeMongo } from "./config/index.ts";

const PORT = config.app.port || 3000;


// START SERVER (SAFE)

const startServer = async () => {
  try {
    // ✅ PostgreSQL (correct)
    await pool.query("SELECT 1");

    // ✅ Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // ✅ Mongo
    await connectMongo();

    const server = app.listen(PORT, () => {
      //console.log(`🚀 Server running on port ${PORT}`);
    });

    // 🔥 GRACEFUL SHUTDOWN
    const shutdown = async (signal: string) => {
      //console.log(`\n⚠️ Received ${signal}. Shutting down...`);

      await closeMongo();

      // ✅ close redis
      if (redisClient.isOpen) {
        await redisClient.quit();
      }

      // ✅ close postgres pool
      await pool.end();

      server.close(() => {
        //console.log("💤 Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};


// PROCESS-LEVEL ERRORS

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});


// INIT

startServer();