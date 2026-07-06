import * as dashboardRepo from "../../repository/orgDashboard.repository.ts";
import { findOrgByOrganizationId } from "../../repository/organization.repository.ts";
import { findPlanByName } from "../../repository/subscriptionPlan.repository.ts";
import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts";
import config from "../../config/config.ts";

const DASHBOARD_CACHE_TTL = config.redis.ttl; 

export const getDashboardSummary = async (organizationId: string) => {
  if (!organizationId) throw new AppError(ERRORS.BAD_REQUEST);

  const cacheKey = `dashboard:org:${organizationId}`;

  //  Check Redis Cache First
  const cachedDashboard = await redisClient.get(cacheKey);
  if (cachedDashboard) {
    return JSON.parse(cachedDashboard);
  }

  //  Cache Miss: Resolve organization context
  const org = await findOrgByOrganizationId(organizationId);
  if (!org) throw new AppError(ERRORS.ORGANIZATION_NOT_FOUND);

  const internalOrgId = Number(org.id); 
  const planDetails = await findPlanByName(org.current_plan || "FREE");

  //  Fire database calls
  const [counters, topLinks, recentLinks, chartData] = await Promise.all([
    dashboardRepo.getDashboardCounters(internalOrgId),
    dashboardRepo.getTopPerformingLinks(internalOrgId),
    dashboardRepo.getRecentLinks(internalOrgId),
    dashboardRepo.getClickAnalyticsOverTime(internalOrgId, 7), 
  ]);

  const totalLinksCreated = parseInt(counters.total_links || "0", 10);
  const totalClicksAccumulated = parseInt(counters.total_clicks || "0", 10);
  const maxLinksLimit = planDetails?.max_links || 100;

  //  Construct Response
  const dashboardData = {
    organization: {
      organizationId: org.organization_id,
      name: org.name,
      current_plan: org.current_plan,
    },
    metrics: {
      total_links: totalLinksCreated,
      total_clicks: totalClicksAccumulated,
    },
    quotas: {
      links: {
        used: totalLinksCreated,
        limit: maxLinksLimit,
        percentage_used: Math.min(
          Math.round((totalLinksCreated / maxLinksLimit) * 100),
          100
        ),
      },
      rate_limits: {
        current_cap_per_min: planDetails?.rate_limit_per_min || 60,
      },
    },
    analytics: chartData,
    top_performing: topLinks,
    recent_activity: recentLinks,
  };

  //  Save to Redis before returning (Fire-and-forget to avoid blocking)
  redisClient.setEx(cacheKey, DASHBOARD_CACHE_TTL, JSON.stringify(dashboardData))
    .catch(err => console.error(`Failed to cache dashboard for org ${organizationId}:`, err));

  return dashboardData;
};