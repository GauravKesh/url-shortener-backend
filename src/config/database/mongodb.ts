import mongoose from "mongoose";
import type { Connection } from "mongoose";
import logger from "../log/logger.ts";
import config from "../config.ts";


type DBConnections = {
  main?: Connection;
  analytics?: Connection;
  logs?: Connection;
};

const connections: DBConnections = {};


// CONNECT ALL DBS

export const connectMongo = async () => {
  try {
    const createConn = async (uri: string, name: string) => {
      const conn = mongoose.createConnection(uri, {
        serverSelectionTimeoutMS: 30000
      });

      conn.on("connected", () =>
        logger.info(`Mongo connected: ${name}`)
      );

      conn.on("error", (err) =>
        logger.error(`Mongo error (${name})`, err)
      );

      await conn.asPromise();
      return conn;
    };

    // 🔥 parallel connections
    const [main, analytics, logs] = await Promise.all([
      createConn(config.db.mongoUrl, "main"),
      createConn(config.db.mongoAnalyticsUrl, "analytics"),
      createConn(config.db.mongoLogsUrl, "logs")
    ]);

    connections.main = main;
    connections.analytics = analytics;
    connections.logs = logs;

    logger.info("All MongoDB connections established");
  } catch (err) {
    logger.error("MongoDB connection failed", err);
    process.exit(1);
  }
};


// GETTERS

export const getMainDB = () => {
  if (!connections.main) throw new Error("Main DB not initialized");
  return connections.main;
};

export const getAnalyticsDB = () => {
  if (!connections.analytics)
    throw new Error("Analytics DB not initialized");
  return connections.analytics;
};

export const getLogsDB = () => {
  if (!connections.logs) throw new Error("Logs DB not initialized");
  return connections.logs;
};


// CLOSE ALL

export const closeMongo = async () => {
  await Promise.all(
    Object.values(connections).map((conn) => conn?.close())
  );

  logger.info("All MongoDB connections closed");
};