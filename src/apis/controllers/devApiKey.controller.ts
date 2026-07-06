import type { Request, Response, NextFunction } from "express";
import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";
import { AppError } from "../../utils/AppError.ts";
import { HTTP_STATUS, MESSAGES, ERRORS } from "../../constants/index.ts";
import { createUrlViaApiKeyService } from "../../services/apikey/devApiKey.service.ts";

export const createCustomUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //Extract context entirely from the API Key, NOT the user session
    const apiKey = (req as any).apiKey; 
    const orgId = apiKey?.organization_id; // Pull org ID directly from the key's DB record

    // Basic request validation (Does the key context exist?)
    if (!orgId || !apiKey) {
      throw new AppError(ERRORS.FORBIDDEN, "Invalid or missing API key context.");
    }

    const { originalUrl, requestedSlug, expiryDays } = req.body;

    // Pass the raw data AND the apiKey rules to the service
    const platformUrlData = await createUrlViaApiKeyService({
      organizationId: Number(orgId),
      apiKey: apiKey, 
      originalUrl,          
      shortCode: requestedSlug,      
      expiryDays 
    });

    return httpResponse(
      req,
      res,
      HTTP_STATUS.CREATED,
      MESSAGES.URL_CREATED || MESSAGES.SUCCESS,
      {
        shortCode: platformUrlData.shortUrl,
        destination: platformUrlData.originalUrl,
        expiresAt: platformUrlData.expiresAt,
        createdAt: new Date()
      }
    );
  } catch (err) {
    httpError(next, err, req);
  }
};