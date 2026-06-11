import winston from "winston";
import "winston-mongodb";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import config from "../config.ts";
import { EApplicationEnvironment } from "../../constants/env.ts";

const addLogId = winston.format((info) => {
  info.logId = "log-"+uuidv4();
  return info;
});

const { combine, timestamp, errors, splat, json, colorize, simple } =
  winston.format;

//  ensure logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: "info",

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
if (config.app.env === EApplicationEnvironment.DEVELOPMENT) {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    })
  );
}


//  production → MongoDB logs
if (config.app.env === EApplicationEnvironment.PRODUCTION) {
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