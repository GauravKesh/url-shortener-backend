import type { Request, Response, NextFunction } from "express";
import * as dashboardService from "../../services/organization/orgDashboard.service.ts";
import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";
import { HTTP_STATUS, MESSAGES, ERRORS } from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";
import logger from "../../config/log/logger.ts";

export default {
  getSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      logger.info(userId)
      // 1. Authenticated check
      if (!userId) {
        throw new AppError(ERRORS.UNAUTHORIZED);
      }

      // 2. Extract orgPublicId from URL context path parameters (e.g., /api/v1/dashboard/:orgPublicId)
      const { organizationId } = req.params;

      if (!organizationId) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      // 🧠 Pass the correct string key context over to the database execution layers
      const dashboardData = await dashboardService.getDashboardSummary(organizationId);

      // 3. Optional: Add a security boundary verification here if needed
      // (e.g., verify if userId belongs to the organization context before returning dashboardData)

      return httpResponse(
        req,
        res,
        HTTP_STATUS.OK,
        MESSAGES.SUCCESS,
        dashboardData
      );
    } catch (err) {
      httpError(next, err, req);
    }
  },
};