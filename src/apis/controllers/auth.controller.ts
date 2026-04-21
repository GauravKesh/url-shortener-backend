import type { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth/auth.service.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import {
  ERRORS,
  HTTP_STATUS,
  MESSAGES,
  EApplicationEnvironment
} from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";

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

      return httpResponse(
        req,
        res,
        HTTP_STATUS.CREATED,
        MESSAGES.REGISTER_SUCCESS,
        {
          user: data.user,
          organization: data.organization,
          accessToken: data.accessToken
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
        maxAge: 7 * 24 * 60 * 60 * 1000
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
        throw new AppError(ERRORS.UNAUTHORIZED);
      }

      const data = await authService.refresh(token);

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
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        {
          accessToken: data.accessToken
        }
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },


  // Logout

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refreshToken;

      if (token) {
        await authService.logout(token);
      }

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
      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        {
          user: req.user?.organizationId
        }
      );
    } catch (err) {
      httpError(next, err, req);
    }
  }
};