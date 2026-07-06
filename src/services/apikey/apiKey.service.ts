import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts"; // <-- Import Redis client

import {
  createApiKey,
  findApiKeyByHash,
  getApiKeysByOrg,
  updateApiKeyByApiKeyId,
  revokeApiKeyByApiKeyId,
  deleteApiKeyByApiKeyId,
  updateLastUsed
} from "../../repository/apiKey.repository.ts";
import { generateApiKey, hashKey, sanitizeApiKey, toPublicApiKey } from "../../utils/apiKeyHashGeneration.ts";

const CACHE_TTL_VALIDATION = 60 * 5; // 5 minutes for valid API keys
const CACHE_TTL_NEGATIVE = 60; // 60 seconds to block spam of invalid keys
const CACHE_TTL_LIST = 30; // 30 seconds for the dashboard list views

// CREATE API KEY
export const createApiKeyService = async ({
  organizationId,
  name,
  rateLimitPerMin,
  maxLinks,
  maxExpiryDays
}: {
  organizationId: number;
  name?: string;
  rateLimitPerMin?: number;
  maxLinks?: number;
  maxExpiryDays?: number;
}) => {
  const { rawKey, keyHash } = generateApiKey();

  const apiKey = await createApiKey({
    organizationId,
    keyHash,
    name,
    rateLimitPerMin,
    maxLinks,
    maxExpiryDays
  });

  // Clear the org's list cache so the new key appears immediately in their dashboard
  await invalidateOrgListCache(organizationId);

  return {
    apiKey: rawKey, // only shown once
    data: toPublicApiKey(apiKey)
  };
};

// VALIDATE API KEY
export const validateApiKeyService = async (rawKey: string) => {
  if (!rawKey) {
    throw new AppError(ERRORS.API_KEY_INVALID);
  }

  const keyHash = hashKey(rawKey);
  const cacheKey = `apikey:hash:${keyHash}`;

  // 1. Check Redis Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    if (cached === "INVALID") {
      throw new AppError(ERRORS.API_KEY_INVALID);
    }
    const parsedKey = JSON.parse(cached);

    if (parsedKey.revoked) {
      throw new AppError(ERRORS.API_KEY_REVOKED);
    }

    // async last used update (non-blocking)
    updateLastUsed(parsedKey.id).catch(() => { });
    return parsedKey; // Already sanitized when saved to cache
  }

  // 2. Cache Miss: Fetch from DB
  const apiKey = await findApiKeyByHash(keyHash);

  // Negative Caching: Protect DB from repeated invalid key spam
  if (!apiKey) {
    await redisClient.setEx(cacheKey, CACHE_TTL_NEGATIVE, "INVALID");
    throw new AppError(ERRORS.API_KEY_INVALID);
  }

  if (apiKey.revoked) {
    // Cache the revoked state too so we don't hit the DB for it again
    const sanitized = sanitizeApiKey(apiKey);
    await redisClient.setEx(cacheKey, CACHE_TTL_VALIDATION, JSON.stringify(sanitized));
    throw new AppError(ERRORS.API_KEY_REVOKED);
  }

  // 3. Cache valid key and return
  const sanitizedKey = sanitizeApiKey(apiKey);
  await redisClient.setEx(cacheKey, CACHE_TTL_VALIDATION, JSON.stringify(sanitizedKey));

  updateLastUsed(apiKey.id).catch(() => { });

  return sanitizedKey;
};

// GET ALL KEYS
export const getApiKeysService = async (
  organizationId: number,
  limit: number = 10,
  offset: number = 0
) => {
  const cacheKey = `apikey:org:${organizationId}:list:${limit}:${offset}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const keys = await getApiKeysByOrg(
    organizationId,
    limit,
    offset
  );

  const result = keys.map(toPublicApiKey);

  await redisClient.setEx(cacheKey, CACHE_TTL_LIST, JSON.stringify(result));

  return result;
};

// UPDATE API KEY
export const updateApiKeyService = async (
  apiKeyId: string,
  organizationId: number,
  updates: {
    name?: string;
    rate_limit_per_min?: number;
    max_links?: number;
    max_expiry_days?: number;
  }
) => {
  const allowed = ["name", "rate_limit_per_min", "max_links", "max_expiry_days"];
  const safeUpdates: Record<string, any> = {};

  for (const key of allowed) {
    if (updates[key as keyof typeof updates] !== undefined) {
      safeUpdates[key] = updates[key as keyof typeof updates];
    }
  }

  if (!Object.keys(safeUpdates).length) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  const updated = await updateApiKeyByApiKeyId(apiKeyId, organizationId, safeUpdates);

  // Invalidate caches
  if (updated?.key_hash) {
    await redisClient.del(`apikey:hash:${updated.key_hash}`);
  }
  await invalidateOrgListCache(organizationId);

  return toPublicApiKey(updated);
};

// REVOKE API KEY
export const revokeApiKeyService = async (apiKeyId: string, organizationId: number) => {
  const revoked = await revokeApiKeyByApiKeyId(apiKeyId, organizationId);

  if (revoked?.key_hash) {
    await redisClient.del(`apikey:hash:${revoked.key_hash}`);
  }
  await invalidateOrgListCache(organizationId);
};

// DELETE API KEY
export const deleteApiKeyService = async (apiKeyId: string, organizationId: number) => {
  // Ensure your repo returns the deleted row so we can get the key_hash
  const deleted = await deleteApiKeyByApiKeyId(apiKeyId, organizationId);

  if (deleted?.key_hash) {
    await redisClient.del(`apikey:hash:${deleted.key_hash}`);
  }
  await invalidateOrgListCache(organizationId);
};

// HELPER: Invalidate list cache
// Deletes standard paginations (page 1 and 2 usually cover 99% of dashboard visits)
const invalidateOrgListCache = async (organizationId: number) => {
  try {
    // If you are using Redis >= 2.8, you could use SCAN to find all keys matching pattern.
    // For simplicity and speed, we manually clear common offsets if SCAN isn't set up:
    await redisClient.del(`apikey:org:${organizationId}:list:10:0`);
    await redisClient.del(`apikey:org:${organizationId}:list:10:10`);
    await redisClient.del(`apikey:org:${organizationId}:list:20:0`);
    await redisClient.del(`apikey:org:${organizationId}:list:50:0`);
  } catch (err) {
    console.error("Failed to invalidate org list cache", err);
  }
};