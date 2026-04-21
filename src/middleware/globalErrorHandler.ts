import type { Request, Response, NextFunction } from "express";
import { ERRORS } from "../constants/index.ts";


export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.statusCode || err.status || ERRORS.INTERNAL.status;
  const fallback = status >= 400 && status < 500 ? ERRORS.BAD_REQUEST : ERRORS.INTERNAL;
  const code = err.code || fallback.code;
  const message = err.message || fallback.message;

  console.error({
    code,
    message,
    endpoint: err.meta?.endpoint || req.originalUrl,
    method: err.meta?.method || req.method,
    ip: err.meta?.ip || req.ip
  });

  return res.status(status).json({
    success: false,
    requestId: req.requestId,
    code,
    message
  });
};