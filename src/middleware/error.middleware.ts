import { ERRORS } from "@/constants/errors.js";
import { AppError } from "@/utils/AppError.js";
import  type { Request, Response, NextFunction } from "express";


export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  console.error("🔥 UNHANDLED ERROR:", err);

  return res.status(500).json({
    success: false,
    error: ERRORS.INTERNAL,
  });
};