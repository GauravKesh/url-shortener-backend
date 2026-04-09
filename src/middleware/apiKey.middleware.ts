import type { Request, Response, NextFunction } from "express";

import { validateApiKeyService } from "../services/apikey/apiKey.service.ts";
import { AppError } from "../utils/AppError.ts";
import { ERRORS } from "../constants/index.ts";


// API KEY AUTH MIDDLEWARE

export const apiKeyMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        //  Check header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(ERRORS.API_KEY_INVALID);
        }

        const rawKey = authHeader.split(" ")[1];

        //  Validate API key
        const apiKey = await validateApiKeyService(rawKey);

        //  Inject into request (unified shape)
        req.user = {
            organizationId: Number(apiKey.organization_id),
            authType: "apiKey"
        };

        req.apiKey = apiKey; // (useful for rate limits, logs)

        next();
    } catch (err) {
        next(err);
    }
};