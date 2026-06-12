import type {
  Request,
  Response,
  NextFunction,
} from "express";

import * as dashboardService from "../../services/dashboard/dashboard.service.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import {
  HTTP_STATUS,
  MESSAGES,
  ERRORS,
} from "../../constants/index.ts";

import { AppError } from "../../utils/AppError.ts";

export default {
  summary: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.userId;
      const organizationId = req.user?.tenantId;
      console.log({userId,organizationId});

      if (!userId || !organizationId) {
        throw new AppError(ERRORS.FORBIDDEN);
      }

      const data = await dashboardService.getSummary({
        userId,
        organizationId,
      });

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        data
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  recentUrls: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const organizationId = req.user?.tenantId

      if (!organizationId) {
        throw new AppError(ERRORS.FORBIDDEN);
      }

      const data = await dashboardService.getRecentUrls({
        organizationId,
      });

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        data
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  topUrls: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const organizationId = req.user?.tenantId

      if (!organizationId) {
        throw new AppError(ERRORS.FORBIDDEN);
      }

      const data = await dashboardService.getTopUrls({
        organizationId,
      });

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        data
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },
};