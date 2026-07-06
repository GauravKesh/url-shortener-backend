import {
  getUserDashboardStats,
  getOrgDashboardStats,
  getRecentUrls as getRecentUrlsRepo,
  getTopUrls as getTopUrlsRepo,
} from "../../repository/dashboard.repository.ts";
import redisClient from "../../config/cache/redis.ts"; 
import config from "../../config/config.ts";

const CACHE_TTL = config.redis.ttl; 

export const getSummary = async ({
  userId,
  organizationId,
}: {
  userId: number;
  organizationId: number;
}) => {
  const cacheKey = `dashboard:summary:org:${organizationId}:user:${userId}`;

  //  Check Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  //  Cache Miss: Fetch from DB
  const [userStats, orgStats] = await Promise.all([
    getUserDashboardStats(userId),
    getOrgDashboardStats(organizationId),
  ]);

  const result = {
    totalUrls: orgStats.total_urls,
    totalClicks: orgStats.total_clicks,
    userUrls: userStats.total_urls,
    userClicks: userStats.total_clicks,
  };

  //  Save to Cache
  redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result))
    .catch(err => console.error(`Failed to cache summary for org ${organizationId}:`, err));

  return result;
};

export const getRecentUrls = async ({
  organizationId,
}: {
  organizationId: number;
}) => {
  const cacheKey = `dashboard:recent:org:${organizationId}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await getRecentUrlsRepo(organizationId);

  redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result))
    .catch(err => console.error(`Failed to cache recent URLs for org ${organizationId}:`, err));

  return result;
};

export const getTopUrls = async ({
  organizationId,
}: {
  organizationId: number;
}) => {
  const cacheKey = `dashboard:top:org:${organizationId}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await getTopUrlsRepo(organizationId);

  redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result))
    .catch(err => console.error(`Failed to cache top URLs for org ${organizationId}:`, err));

  return result;
};