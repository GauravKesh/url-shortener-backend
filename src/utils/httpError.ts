import type { NextFunction, Request } from "express";
import { randomUUID } from "crypto";

import { AppError } from "./AppError.ts";
import { ERRORS } from "../constants/index.ts";
import logger from "../config/log/logger.ts";
type HttpErrorExtra = Record<string, any>;

const httpError = (
  next: NextFunction,
  err: any,
  req: Request,
  extra?: HttpErrorExtra
) => {
  let error: AppError;

  //  if already AppError → use it
  if (err instanceof AppError) {
    error = err;
  }
  //  if custom error object passed (ERRORS.*)
  else if (err?.code && err?.message && err?.status) {
    error = new AppError(err);
  }
  //  fallback
  else {
    error = new AppError(ERRORS.INTERNAL);
  }

  //  attach metadata
  error.meta = {
    ...error.meta,
    requestId: req.requestId,
    endpoint: req.originalUrl,
    method: req.method,
    ip: req.ip,
    ...(extra || {})
  };

  const httpErrorId = "err-" + randomUUID();

  //  structured logging
  logger.error("API Error", {
    httpErrorId,
    err,
    requestId: req.requestId,
    message: error.message,
    code: error.code,
    status: error.statusCode,
    stack: error.stack,
    meta: error.meta,
  });

  return next(error);
};

export default httpError;
