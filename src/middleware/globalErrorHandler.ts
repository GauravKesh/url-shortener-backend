import type { Request, Response, NextFunction } from "express";
// import { AppError } from "@/utils/AppError.ts";


export const  globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error({
    code: err.code,
    message: err.message,
    endpoint: err.meta?.endpoint,
    method: err.meta?.method,
    ip: err.meta?.ip
  });

  return res.status(err.statusCode || 500).json({
    success: false,
    requestId:req.requestId,
    code: err.code || "GEN_500",
    message: err.message || "Something went wrong"
  });
};