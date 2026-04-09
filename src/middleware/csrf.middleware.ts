import type { Request, Response, NextFunction } from "express";
import { randomBytes, timingSafeEqual } from "crypto";

import { HTTP_STATUS, MESSAGES, ERRORS } from "../constants/index.ts";
import httpError from "../utils/httpError.ts";
import { AppError } from "../utils/AppError.ts";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";

/*
  Generate CSRF token and set cookie
*/
export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = randomBytes(32).toString("hex");

    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // must be readable by frontend
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return next();
  } catch (err) {
    return httpError(next, err, req);
  }
};

/*
  Validate CSRF token
*/
export const csrfProtect = (req: Request, res: Response, next: NextFunction) => {
  try {
    // skip safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next();
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME] as string;

    if (!cookieToken || !headerToken) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    // timing-safe comparison
    const isValid = timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );

    if (!isValid) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    return next();
  } catch (err) {
    return httpError(next, err, req, ERRORS.INVALID_TOKEN);
  }
};