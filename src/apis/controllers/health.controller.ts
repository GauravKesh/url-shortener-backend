import type { Request,Response,NextFunction } from "express";
import redisClient from "../../config/cache/redis.ts";
import pool from "../../config/database/postgresql.ts";
import { HTTP_STATUS, MESSAGES } from "../../constants/index.ts";
import httpResponse from "../../utils/httpResponse.ts";
import { getMainDB, getAnalyticsDB, getLogsDB } from "../../config/database/mongodb.ts";

// optional timeout
const withTimeout = (promise: Promise<any>, ms = 1000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);

// 🔹 LIVENESS → server alive (no deps)
export const livenessCheck = (_req: Request, res: Response) => {
  return httpResponse(
    _req,
    res,
    HTTP_STATUS.OK,
    MESSAGES.LIVENESS_OK,
    {
      status: "ALIVE",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  );
};

// 🔹 Individual checks

const checkPostgres = async () => {
  try {
    await withTimeout(pool.query("SELECT 1"));
    return {
      status: true,
      message: MESSAGES.DATABASE_CONNECTED,
    };
  } catch (err) {
    return {
      status: false,
      message: `${MESSAGES.DATABASE_UNAVAILABLE}: ${(err as Error).message}`,
    };
  }
};

const checkMongoConnections = async () => {
  const check = async (connGetter: () => any) => {
    try {
      const conn = connGetter();

      const isConnected = conn.readyState === 1;

      if (!isConnected) {
        return {
          status: false,
          message: `${MESSAGES.DATABASE_UNAVAILABLE}: not connected`,
        };
      }

      // ✅ add timeout here
      await withTimeout(conn.db.admin().ping());

      return {
        status: true,
        message: MESSAGES.DATABASE_CONNECTED,
      };
    } catch (err) {
      return {
        status: false,
        message: `${MESSAGES.DATABASE_UNAVAILABLE}: ${(err as Error).message}`,
      };
    }
  };

  const [main, analytics, logs] = await Promise.all([
    check(getMainDB),
    check(getAnalyticsDB),
    check(getLogsDB),
  ]);

  return {
    status: main.status && analytics.status && logs.status,
    services: {
      main,
      analytics,
      logs,
    },
  };
};

const checkRedis = async () => {
  try {
    const res = await withTimeout(redisClient.ping());
    return {
      status: res === "PONG",
      message:
        res === "PONG"
          ? MESSAGES.CACHE_CONNECTED
          : `${MESSAGES.CACHE_UNAVAILABLE}: ping failed`,
    };
  } catch (err) {
    return {
      status: false,
      message: `${MESSAGES.CACHE_UNAVAILABLE}: ${(err as Error).message}`,
    };
  }
};

// 🔹 READINESS → deps check
export const readinessCheck = async (req: Request, res: Response) => {
  const [pg, mongo, redis] = await Promise.all([
    checkPostgres(),
    checkMongoConnections(), 
    checkRedis(),
  ]);

  const isReady = pg.status && mongo.status && redis.status;

  return httpResponse(
    req,
    res,
    isReady ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE,
    isReady ? MESSAGES.READINESS_OK : MESSAGES.READINESS_NOT_READY,
    {
      status: isReady ? "READY" : "NOT_READY",

      services: {
        postgres: pg,
        mongodb: mongo.services, 
        redis: redis,
      },

      timestamp: new Date().toISOString(),
    }
  );
};
// 🔹 FULL HEALTH (optional combined endpoint)
export const fullHealthCheck = async (req: Request, res: Response) => {
  const [pg, mongo, redis] = await Promise.all([
    checkPostgres(),
    checkMongoConnections(), 
    checkRedis(),
  ]);

  const healthy = pg.status && mongo.status && redis.status;

  return httpResponse(
    req,
    res,
    healthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE,
    healthy ? MESSAGES.HEALTH_OK : MESSAGES.HEALTH_DEGRADED,
    {
      status: healthy ? "HEALTHY" : "DEGRADED",

      services: {
        postgres: pg,
        mongodb: mongo.services, // ✅ fix
        redis: redis,
      },

      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  );
};