import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId =
    req.headers["x-request-id"] || `req-${randomUUID()}`;

  // attach to request
  (req as any).requestId = requestId;

  // attach to response header
  res.setHeader("x-request-id", requestId);

  next();
};