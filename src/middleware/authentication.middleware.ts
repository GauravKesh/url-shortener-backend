import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ERRORS, HTTP_STATUS, MESSAGES } from "../constants/index.ts";
import httpResponse from "../utils/httpResponse.ts";
import httpError from "../utils/httpError.ts";
import config from "../config/config.ts";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.UNAUTHORIZED,
        error: ERRORS.INVALID_TOKEN,
      });
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret) as any;

    req.user = {
      userId: Number(decoded.userId),
      role: decoded.role,
      tenantId: Number(decoded.organizationId),
      organizationId: Number(decoded.organizationId),
    };

    return next();
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        status: HTTP_STATUS.UNAUTHORIZED,
        message: "Access token expired",
        error: ERRORS.TOKEN_EXPIRED, 
      });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        status: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid token",
        error: ERRORS.INVALID_TOKEN,
      });
    }

    return httpError(next, err, req);
  }
};