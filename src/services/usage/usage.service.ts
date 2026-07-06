import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts"; 

import {
  getUsage,
  createUsage,
  incrementUsage
} from "../../repository/usage.repository.ts";

/* allowed fields (prevent SQL injection via field param) */
const ALLOWED_FIELDS = [
  "url_count",
  "api_calls",
  "clicks",
  "links_created"
] as const;

type UsageField = typeof ALLOWED_FIELDS[number];

const CACHE_TTL = 60 * 5; // 5 minutes

/* get start of current month (STRICTLY UTC) */
const getCurrentPeriod = () => {
  const now = new Date();
  // Always use UTC for billing/usage periods to avoid server-region mismatches
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return { start, end };
};

/* helper to generate a unique cache key per org and billing period */
const getCacheKey = (orgId: number, start: Date) => {
  return `usage:org:${orgId}:period:${start.getTime()}`;
};

/* ensure usage row exists safely */
export const ensureUsage = async (orgId: number) => {
  const { start, end } = getCurrentPeriod();

  let usage = await getUsage(orgId, start);

  if (!usage) {
    try {
      usage = await createUsage(orgId, start, end);
    } catch (err: any) {
      if (err.code === '23505') { // Postgres unique_violation
        usage = await getUsage(orgId, start);
      } else {
        throw err;
      }
    }
  }

  return usage;
};

/* increment usage safely */
export const increment = async (
  orgId: number,
  field: UsageField
) => {
  if (!ALLOWED_FIELDS.includes(field)) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  const { start } = getCurrentPeriod();

  // Ensure row exists before incrementing
  await ensureUsage(orgId);
  await incrementUsage(orgId, field, start);

  // Invalidate the cache immediately so limit checks don't read stale data
  const cacheKey = getCacheKey(orgId, start);
  await redisClient.del(cacheKey);
};

/* get current usage */
export const getCurrentUsage = async (orgId: number) => {
  const { start } = getCurrentPeriod();
  const cacheKey = getCacheKey(orgId, start);

  // 1. Check Redis Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache Miss: Fetch from DB
  let usage = await getUsage(orgId, start);

  if (!usage) {
    usage = await ensureUsage(orgId);
  }

  // 3. Save to Redis (Fire-and-forget)
  redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(usage))
    .catch(err => console.error(`Failed to cache usage for org ${orgId}:`, err));

  return usage;
};