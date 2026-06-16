import { AppError } from "../../utils/AppError.ts";
import { generateShortCode } from "../url/generateShortCode.service.ts";
import { ERRORS } from "../../constants/errors.ts";
import { createUrl } from "../../repository/url.repository.ts";

// Import your usage tracker service
import { increment } from "../usage/usage.service.ts";

// 🌟 Import your API key repository function (Adjust the path if needed)
import { incrementApiKeyLinkCount } from "../../repository/apiKey.repository.ts";

/*
  Create URL via Developer API Key Proxy
*/
export interface CreateUrlViaApiKeyInput {
    originalUrl: string;
    shortCode?: string;
    organizationId: number;
    apiKeyId: number; //  Added to track which unique token is making the request
    expiryDays?: number;
}

export const createUrlViaApiKeyService = async ({
    originalUrl,
    shortCode,
    organizationId,
    apiKeyId, //  Destructured parameter
    expiryDays,
}: CreateUrlViaApiKeyInput) => {

    if (!originalUrl) {
        throw new AppError(ERRORS.BAD_REQUEST);
    }

    // Process or auto-generate the custom alias/slug
    if (shortCode) {
        shortCode = await generateShortCode(shortCode);
    } else {
        shortCode = await generateShortCode();
    }

    // Calculate expiration timestamp if expiryDays is provided
    let expiresAt: Date | null = null;
    if (expiryDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);
    }

    // 1. Persist to DB via your existing repository layer
    const url = await createUrl({
        shortCode,
        originalUrl,
        userId: organizationId,
        organizationId,
        expiresAt,
    });

    //  Increment Telemetry Tracking Metrics concurrently
    // (We do this after successful DB creation so we don't overcount failed requests)
    await Promise.all([
        increment(organizationId, "api_calls"),     // Org Monthly Metric
        increment(organizationId, "links_created"),  // Org Monthly Metric
        incrementApiKeyLinkCount(apiKeyId)           // Key-specific Cumulative Counter
    ]);

    return {
        shortUrl: url.short_code,
        originalUrl: url.original_url,
        expiresAt: url.expires_at,
    };
};