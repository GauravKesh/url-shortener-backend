
import type { Request, Response, NextFunction } from "express";

import * as usageService from "../../services/usage/usage.service.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import { ERRORS, HTTP_STATUS, MESSAGES } from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";

export default {
	/* get current usage */
	getCurrent: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const orgId = req.user?.tenantId ?? req.user?.organizationId;

			if (!orgId) {
				throw new AppError(ERRORS.FORBIDDEN);
			}

			const usage = await usageService.getCurrentUsage(Number(orgId));

			return httpResponse(
				req,
				res,
				HTTP_STATUS.OK,
				MESSAGES.USAGE_FETCHED,
				{ usage }
			);
		} catch (err) {
			httpError(next, err, req);
		}
	}
};