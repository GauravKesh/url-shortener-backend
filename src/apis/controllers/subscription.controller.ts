// subscription.controller.ts

import type { Request, Response, NextFunction } from "express";
import * as subscriptionService from "../../services/subscription/subscription.service.ts";
import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";
import { HTTP_STATUS, MESSAGES, ERRORS } from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";

export default {
  /**
   *  Get all available subscription plans
   */
  getPlans: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await subscriptionService.getAllPlans();

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        { plans }
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  /* purchase / upgrade */
  purchase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const orgId = req.user?.tenantId;
      // //console.log(orgId);

      if (!userId) {
        throw new AppError(ERRORS.FORBIDDEN);
      }

      const { planId } = req.body;

      if (!planId) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const data = await subscriptionService.purchasePlan(
        userId,
        Number(planId)
      );

      return httpResponse(
        req,
        res,
        HTTP_STATUS.CREATED,
        MESSAGES.SUCCESS,
        data
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },

  /* get current subscription */
  getCurrent: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const userId = req.user?.userId;
      const orgId = req.user?.tenantId;
      // //console.log(orgId);

      if (!orgId) {
        throw new AppError(ERRORS.NOT_FOUND);
      }

      const subscription =
        await subscriptionService.getCurrentPlan(orgId);

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        { subscription }
      );
    } catch (err) {
      httpError(next, err, req);
    }
  }
};