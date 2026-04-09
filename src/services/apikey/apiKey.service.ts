

import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

import {
  createApiKey,
  findApiKeyByHash,
  getApiKeysByOrg,
  updateApiKey,
  revokeApiKey,
  deleteApiKey,
  updateLastUsed
} from "../../repository/apiKey.repository.ts";
import { generateApiKey, hashKey, sanitizeApiKey } from "../../utils/apiKeyHashGeneration.ts";

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

  return {
    apiKey: rawKey, // only shown once
    data: sanitizeApiKey(apiKey)
  };
};



// VALIDATE API KEY

export const validateApiKeyService = async (rawKey: string) => {
  if (!rawKey) {
    throw new AppError(ERRORS.API_KEY_INVALID);
  }

  const keyHash = hashKey(rawKey);

  const apiKey = await findApiKeyByHash(keyHash);

  if (!apiKey) {
    throw new AppError(ERRORS.API_KEY_INVALID);
  }

  if (apiKey.revoked) {
    throw new AppError(ERRORS.API_KEY_REVOKED);
  }


  // async last used update (non-blocking)
  updateLastUsed(apiKey.id).catch(() => {});

  return sanitizeApiKey(apiKey);
};


// GET ALL KEYS

export const getApiKeysService = async (
  organizationId: number,
  limit?: number,
  offset?: number
) => {
  const keys = await getApiKeysByOrg(
    organizationId,
    limit,
    offset
  );

  return keys.map(sanitizeApiKey);
};



// UPDATE API KEY

export const updateApiKeyService = async (
  id: number,
  organizationId:number,
  updates: {
    name?: string;
    rate_limit_per_min?: number;
    max_links?: number;
    max_expiry_days?: number;
  }
) => {
  const allowed = [
    "name",
    "rate_limit_per_min",
    "max_links",
    "max_expiry_days"
  ];

  const safeUpdates: Record<string, any> = {};

  for (const key of allowed) {
    if (updates[key as keyof typeof updates] !== undefined) {
      safeUpdates[key] = updates[key as keyof typeof updates];
    }
  }

  if (!Object.keys(safeUpdates).length) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  const updated = await updateApiKey(id,organizationId,safeUpdates);

  return sanitizeApiKey(updated);
};



// REVOKE API KEY

export const revokeApiKeyService = async (id: number,organizationId:number) => {
  await revokeApiKey(id,organizationId);
};



// DELETE API KEY

export const deleteApiKeyService = async (id: number,organizationId:number) => {
  await deleteApiKey(id,organizationId);
};