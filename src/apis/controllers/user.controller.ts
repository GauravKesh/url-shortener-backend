import type { Request, Response, NextFunction } from "express";

import * as userService from "../../services/user/user.service.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import {
  HTTP_STATUS,
  MESSAGES,
  ERRORS
} from "../../constants/index.ts";

import { AppError } from "../../utils/AppError.ts";

export default {
  /* 
     GET CURRENT USER
   */
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;


      if (!userId) {
        throw new AppError(ERRORS.UNAUTHORIZED);
      }

      const user = await userService.getUserById(userId);
      console.log("user:", user);
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

  /* 
     UPDATE PROFILE
   */
  updateProfile: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError(ERRORS.UNAUTHORIZED);
      }

      const { name, avatar_url } = req.body;

      const user = await userService.updateProfile(userId, {
        name,
        avatar_url
      });

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

  /* 
     CHANGE PASSWORD
   */
  changePassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError(ERRORS.UNAUTHORIZED);
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      await userService.changePassword({
        userId,
        oldPassword,
        newPassword
      });

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  /* 
     DELETE USER
   */
  deleteAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError(ERRORS.UNAUTHORIZED);
      }

      await userService.removeUser(userId);

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS
      );
    } catch (err) {
      httpError(next, err, req);
    }
  }
};