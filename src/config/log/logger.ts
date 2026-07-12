import winston from "winston";
import "winston-mongodb";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import config from "../config.ts";
import { EApplicationEnvironment } from "../../constants/env.ts";

const addLogId = winston.format((info) => {
  info.logId = `log-${uuidv4()}`;
  return info;
});

const { combine, timestamp, errors, splat, json, colorize, printf } =
  winston.format;

const formatConsoleMeta = (info: winston.Logform.TransformableInfo) => {
  const reservedKeys = new Set([
    "level",
    "message",
    "timestamp",
    "label",
    "logId",
    "service",
    "stack",
  ]);

  const metadata: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(info)) {
    if (!reservedKeys.has(key)) {
      metadata[key] = value;
    }
  }

  return metadata;
};

const prettyConsoleFormat = printf((info) => {
  const parts: string[] = [];
  const time = info.timestamp ?? new Date().toISOString();
  const level = String(info.level);
  const service = info.service ? `[${info.service}]` : "";
  const logId = info.logId ? `[${info.logId}]` : "";

  parts.push(`${time} ${level} ${service} ${logId}`.trim());

  if (info.message) {
    parts.push(String(info.message));
  }

  const metadata = formatConsoleMeta(info);
  if (Object.keys(metadata).length > 0) {
    parts.push(JSON.stringify(metadata, null, 2));
  }

  if (info.stack) {
    parts.push(String(info.stack));
  }

  return parts.join("\n");
});

//  ensure logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: config.logging.level,

  format: combine(
    addLogId(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    splat(),
    json()
  ),

  defaultMeta: { service: "url-shortener" },

  transports: [
    //  file fallback (always)
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

//  development → console logs
if (config.app.env === EApplicationEnvironment.PRODUCTION) {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        splat(),
        prettyConsoleFormat
      ),
    })
  );
}


//  production → MongoDB logs
if (config.app.env === EApplicationEnvironment.DEVELOPMENT) {
  logger.add(
    new winston.transports.MongoDB({
      level: "info",
      db: config.db.mongoLogsUrl, // ✅ plain connection string
      collection: "logs",
      tryReconnect: true,
      capped: true,
      cappedSize: 10000000,
      format: combine(timestamp(), json()),
    })
  );
}
export default logger;