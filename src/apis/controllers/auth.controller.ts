import type { Request, Response, NextFunction, CookieOptions } from "express";
import * as authService from "../../services/auth/auth.service.ts";
import * as userService from "../../services/user/user.service.ts";
import redisClient from "../../config/cache/redis.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import {
  ERRORS,
  HTTP_STATUS,
  MESSAGES,
  EApplicationEnvironment
} from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";
import config from "../../config/config.ts";
import { deleteAllSessions } from "../../repository/session.repository.ts";

// Environment check
const isProd = process.env.NODE_ENV === EApplicationEnvironment.PRODUCTION;

export const getCookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  ...(isProd && {
    domain: ".gkrcoder.me",
  }),
  path: "/",
  maxAge,
});

export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  ...(isProd && {
    domain: ".gkrcoder.me",
  }),
  path: "/",
};

export default {

  // Signup
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, organization_name } = req.body;

      if (!email || !password) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const userAgent = req.headers["user-agent"] as string | undefined;
      const ip = req.ip;

      const data = await authService.signup({
        email,
        password,
        organization_name,
        ip,
        userAgent,
      });

      // Fixed: invoked getCookieOptions with maxAge
      res.cookie(
        "refreshToken",
        data.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000)
      );

      res.cookie(
        "accessToken",
        data.accessToken,
        getCookieOptions(config.jwt.accessExpiry)
      );

      return httpResponse(
        req,
        res,
        HTTP_STATUS.CREATED,
        MESSAGES.REGISTER_SUCCESS,
        {
          user: data.user,
          organization: data.organization,
        }
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  // Login
  login: async (req: Request, res: Response, next: NextFunction) => {
    // await deleteAllSessions();
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const userAgent = req.headers["user-agent"] as string | undefined;
      const ip = req.ip;

      const data = await authService.login({
        email,
        password,
        ip,
        userAgent,
      });

      res.cookie(
        "refreshToken",
        data.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000)
      );

      res.cookie(
        "accessToken",
        data.accessToken,
        getCookieOptions(config.jwt.accessExpiry)
      );

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.LOGIN_SUCCESS,
        {
          user: data.user,
          organization: data.organization,
        }
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  // Refresh Token
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refreshToken;

      if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.UNAUTHORIZED,
          error: ERRORS.UNAUTHORIZED,
        });
      }

      const data = await authService.refresh(token);

      res.cookie(
        "accessToken",
        data.accessToken,
        getCookieOptions(config.jwt.accessExpiry)
      );

      res.cookie(
        "refreshToken",
        data.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000)
      );

      return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.SUCCESS, {
        accessToken: data.accessToken,
      });
    } catch (err) {
      res.clearCookie("accessToken", clearCookieOptions);
      res.clearCookie("refreshToken", clearCookieOptions);

      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Session expired, please log in again",
        error: ERRORS.INVALID_SESSION,
      });
    }
  },

  // Logout
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie("accessToken", clearCookieOptions);
      res.clearCookie("refreshToken", clearCookieOptions);

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.LOGOUT_SUCCESS
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  // Current User
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return httpError(next, new Error("User ID not found"), req);
      }

      const user = await userService.getUserById(userId);

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        { user }
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  requestPasswordReset: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const data = await authService.requestPasswordReset(email);

      return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.PASSWORD_RESET_SENT, data);
    } catch (err) {
      httpError(next, err, req);
    }
  },

  resetPassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token, newPassword, logoutOtherSessions } = req.body;

      if (!token || !newPassword) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      await authService.confirmPasswordReset(
        token,
        newPassword,
        !!logoutOtherSessions
      );

      return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.PASSWORD_RESET_SUCCESS);
    } catch (err) {
      httpError(next, err, req);
    }
  },
};