import type { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth/auth.service.ts";
import * as userService from "../../services/user/user.service.ts";


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

// Environment check
const isProd =
  process.env.NODE_ENV === EApplicationEnvironment.PRODUCTION;

export default {

  // Signup

  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, organization_name } = req.body;

      if (!email || !password) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const data = await authService.signup({
        email,
        password,
        organization_name
      });

      // set refresh token cookie
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });


      res.cookie("accessToken", data.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: config.jwt.accessExpiry,
      });


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
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const data = await authService.login({
        email,
        password
      });

      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.cookie("accessToken", data.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000
      });

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.LOGIN_SUCCESS,
        {
          user: data.user,
          organization: data.organization,
          // accessToken: data.accessToken
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
      // ✅ Return 401 so frontend interceptor knows to redirect to login
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: ERRORS.UNAUTHORIZED,
      });
    }

    const data = await authService.refresh(token);

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    });

    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,            // 15 min — match signAccessToken expiry
    });

    return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.SUCCESS, {
      accessToken: data.accessToken,
    });
  } catch (err) {
    // ✅ Catch AppError(INVALID_SESSION) and return 401, not 500
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Session expired, please log in again",
      error: ERRORS.INVALID_SESSION,
    });
  }
},


  // Logout

  logout: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshToken =
        req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

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
      console.log("req.user:", req.user);

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
  }
};