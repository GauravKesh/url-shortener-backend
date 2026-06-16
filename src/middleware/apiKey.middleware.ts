import type { Request, Response, NextFunction } from "express";
import { validateApiKeyService } from "../services/apikey/apiKey.service.ts";
import { AppError } from "../utils/AppError.ts";
import { ERRORS } from "../constants/index.ts";
// import { ApiKeyData } from '../types/express.d.ts';

/**
 * Middleware to authenticate public developer API requests via a Bearer token.
 * Chained before protected developer controllers and rate limiters.
 */
export const apiKeyMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        //console.log(authHeader);
        // 1. Verify the presence and format of the Authorization header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(
                ERRORS.API_KEY_INVALID || { status: 401, message: "Invalid or missing API key format." }
            );
        }

        // 2. Isolate the raw key payload
        const rawKey = authHeader.split(" ")[1];
        if (!rawKey) {
            throw new AppError(
                ERRORS.API_KEY_INVALID || { status: 401, message: "API key token is empty." }
            );
        }

        // 3. Delegate hashing and DB record lookups to your service layer
        // Type assertion ensures it aligns perfectly with your Postgres row payload
        const apiKey = await validateApiKeyService(rawKey);

        //console.log(apiKey);

        // 4. Inject unified security context into the request object
        req.user = {
            organizationId: Number(apiKey.organization_id),
            authType: "API_KEY"
        };

        // 5. Cache the full row payload for downstream usage (e.g., rate limits, route loggers)
        req.apiKey = apiKey;

        next();
    } catch (err) {
        // Automatically passes any AppErrors or database failures down to your express global error handler
        next(err);
    }
};