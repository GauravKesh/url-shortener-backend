import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts";

import { createUrl } from "../../repository/url.repository.ts";
import { incrementApiKeyLinkCount } from "../../repository/apiKey.repository.ts";
import { generateShortCode } from "../url/generateShortCode.service.ts";
import { increment } from "../usage/usage.service.ts";
import { enforceLinkCreationLimit } from "../subscription/enforcePlanLimits.ts";

interface CreateUrlViaApiKeyDto {
  organizationId: number;
  apiKey: any; // The full API key object from the middleware
  originalUrl: string;
  shortCode?: string;
  expiryDays?: number;
}

export const createUrlViaApiKeyService = async ({
  organizationId,
  apiKey,
  originalUrl,
  shortCode,
  expiryDays
}: CreateUrlViaApiKeyDto) => {
  if (!originalUrl) {
    throw new AppError(ERRORS.BAD_REQUEST, "originalUrl is required.");
  }

  //  ENFORCE GLOBAL ORG SUBSCRIPTION LIMITS
  await enforceLinkCreationLimit(organizationId);

  //  ENFORCE API KEY SPECIFIC LIMITS (ANTI-ABUSE)
  const apiKeyLinksCount = Number(apiKey.links_created || 0);
  const apiKeyMaxLimit = apiKey.max_links ? Number(apiKey.max_links) : null;

  if (apiKeyMaxLimit && apiKeyLinksCount >= apiKeyMaxLimit) {
    throw new AppError(ERRORS.API_KEY_LIMIT_REACHED);
  }

  //  ENFORCE EXPIRY CEILINGS
  if (apiKey.max_expiry_days && expiryDays && expiryDays > apiKey.max_expiry_days) {
    throw new AppError(
      ERRORS.BAD_REQUEST,
      `Your API tier limits custom links to a maximum of ${apiKey.max_expiry_days} days.`
    );
  }

  //  CALCULATE EXPIRATION DATE
  const daysToAdd = expiryDays || apiKey.max_expiry_days || undefined;
  let expiresAt = null;

  if (daysToAdd) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(daysToAdd));
  }

  //  GENERATE ALIAS
  const finalShortCode = shortCode 
    ? await generateShortCode(shortCode) 
    : await generateShortCode();

  // 6. DATABASE INSERTION (Create the URL)
  const url = await createUrl({
    shortCode: finalShortCode,
    originalUrl,
    organizationId,
    userId: null, // API Keys act on behalf of the org, not a specific user
    domainId: null, // Add domain support here later if needed
    expiresAt
  });

  //  ATOMIC INCREMENTS
  // We don't await these synchronously to keep the API response ultra-fast.
  // PostgreSQL handles the atomic `links_created = links_created + 1` safely.
  Promise.all([
    incrementApiKeyLinkCount(apiKey.id),
    increment(organizationId, "links_created"),
    invalidateDashboardCaches(organizationId)
  ]).catch(err => console.error(`[DevApiKeyService] Background task failed for Org ${organizationId}:`, err));

  return {
    shortUrl: url.short_code,
    originalUrl: url.original_url,
    expiresAt: url.expires_at,
  };
};

// --- HELPER: Invalidate Dashboard Caches ---
// Ensures that when a developer creates a link via API, the frontend dashboard updates immediately.
const invalidateDashboardCaches = async (organizationId: number) => {
  try {
    await redisClient.del(`dashboard:recent:org:${organizationId}`);
    await redisClient.del(`dashboard:org:${organizationId}`);
    
    // Note: We don't necessarily clear 'dashboard:top:org' here because 
    // a newly created link has 0 clicks and won't affect the "Top" list yet.
  } catch (error) {
    console.error(`Failed to invalidate dashboard caches for Org ${organizationId}`, error);
  }
};