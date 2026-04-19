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
      return httpResponse(
        req,
        res,
        HTTP_STATUS.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
        ERRORS.INVALID_TOKEN
      );
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret) as any;

    //  attach user
    req.user = {
      userId: Number(decoded.userId),
      role: decoded.role,
      tenantId: Number(decoded.organizationId),
    };

    return next();
  } catch (err: any) {
    //  classify error properly

    if (err instanceof jwt.TokenExpiredError) {
      return httpError(
        next,
        ERRORS.TOKEN_EXPIRED,
        req,
        { reason: "access token expired" }
      );
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return httpError(
        next,
        ERRORS.INVALID_TOKEN,
        req,
        { reason: err.message } // invalid signature / malformed
      );
    }

    return httpError(next, err, req);
  }
};