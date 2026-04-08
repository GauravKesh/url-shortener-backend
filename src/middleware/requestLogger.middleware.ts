import logger from "../config/log/logger.ts";
import type { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  const originalEnd = res.end;

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("HTTP Request", {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });
  });

  next();
};