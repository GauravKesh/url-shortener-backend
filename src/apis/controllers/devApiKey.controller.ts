import type { Request, Response, NextFunction } from "express";
import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";
import { AppError } from "../../utils/AppError.ts";
import { HTTP_STATUS, MESSAGES, ERRORS } from "../../constants/index.ts";
import { createUrlViaApiKeyService } from "../../services/apikey/devApiKey.service.ts";

export const createCustomUrl = async (req: Request, res: Response, next: NextFunction) => {
  const logPrefix = "[DevApiKeyController:createCustomUrl]";
  
  try {
    const orgId = req.user?.organizationId;
    const limits = req.apiKey; 

    // console.debug(`${logPrefix} Incoming request. Org ID: ${orgId}, API Key ID: ${limits?.id}`);

    if (!orgId || !limits) {
      // console.warn(`${logPrefix} Unauthorized attempt. Context missing from request object.`);
      throw new AppError(ERRORS.FORBIDDEN);
    }

    //Destructure client developer payload
    const { longUrl, requestedSlug, expiryDays } = req.body;
    // console.debug(`${logPrefix} Payload parsed:`, { longUrl, requestedSlug, expiryDays });


    //ENFORCE INDIVIDUAL API KEY LIMITS (ANTI-ABUSE) ---
    
    // Read tracker columns directly from your pre-loaded middleware context
    const apiKeyLinksCount = (limits as any).links_created ? Number((limits as any).links_created) : 0;
    const apiKeyMaxLimit = limits.max_links ? Number(limits.max_links) : null;

    if (apiKeyMaxLimit && apiKeyLinksCount >= apiKeyMaxLimit) {
      // console.warn(
      //   `${logPrefix} Anti-abuse block: Key ID ${limits.id} exhausted its allocation (${apiKeyLinksCount}/${apiKeyMaxLimit}).`
      // );
      
      // Cleanly maps to your custom ERRORS dictionary definition
      throw new AppError(ERRORS.API_KEY_LIMIT_REACHED);
    }


    // ENFORCE EXPIRY CEILINGS ---

    // Validate custom expiry ceiling against snake_case DB column name
    if (limits.max_expiry_days && expiryDays > limits.max_expiry_days) {
      // console.warn(
      //   `${logPrefix} Validation failed: Requested expiry (${expiryDays} days) exceeds limits.max_expiry_days (${limits.max_expiry_days} days) for Key ID: ${limits.id}`
      // );
      throw new AppError(
        ERRORS.BAD_REQUEST, 
        `Your API tier limits custom links to a maximum of ${limits.max_expiry_days} days.`
      );
    }

    const calculatedExpiry = expiryDays || limits.max_expiry_days || undefined;
    // console.debug(`${logPrefix} Executing link service with expiry window: ${calculatedExpiry} days`);


    // ---  EXECUTION PIPELINE ---

    // Run creation processing, passing down the key ID to bump cumulative tracking counters
    const platformUrlData = await createUrlViaApiKeyService({
      organizationId: orgId,
      apiKeyId: Number(limits.id),
      originalUrl: longUrl,          
      shortCode: requestedSlug,      
      expiryDays: calculatedExpiry
    });

    // //console.log(`${logPrefix} Success! Custom URL provisioned. Short code assigned: ${platformUrlData.shortUrl}`);

    //  Return the response back to their outside application code
    return httpResponse(
      req,
      res,
      HTTP_STATUS.CREATED,
      MESSAGES.SUCCESS,
      {
        shortCode: platformUrlData.shortUrl,
        destination: platformUrlData.originalUrl,
        expiresAt: platformUrlData.expiresAt,
        createdAt: new Date()
      }
    );
  } catch (err) {
    // console.error(`${logPrefix} Critical exception intercepted:`, err);
    httpError(next, err, req);
  }
};