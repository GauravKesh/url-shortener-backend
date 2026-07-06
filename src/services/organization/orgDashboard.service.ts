import * as dashboardRepo from "../../repository/orgDashboard.repository.ts";
import { findOrgByOrganizationId } from "../../repository/organization.repository.ts";
import { findPlanByName } from "../../repository/subscriptionPlan.repository.ts";
import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

export const getDashboardSummary = async (organizationId: string) => {
  if (!organizationId) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  // 1. Resolve organization context by its public UUID
  const org = await findOrgByOrganizationId(organizationId);
  if (!org) {
    throw new AppError(ERRORS.ORGANIZATION_NOT_FOUND);
  }

  // 2. Extract the internal database ID (bigint) for the queries
  const internalOrgId = Number(org.id); 

  // Fetch the current plan details to build comparison quota progress bars
  const planDetails = await findPlanByName(org.current_plan || "FREE");

  // 3. Fire database calls using the INTERNAL NUMERIC ID
  const [counters, topLinks, recentLinks, chartData] = await Promise.all([
    dashboardRepo.getDashboardCounters(internalOrgId),
    dashboardRepo.getTopPerformingLinks(internalOrgId),
    dashboardRepo.getRecentLinks(internalOrgId),
    dashboardRepo.getClickAnalyticsOverTime(internalOrgId, 7), 
  ]);

  const totalLinksCreated = parseInt(counters.total_links || "0", 10);
  const totalClicksAccumulated = parseInt(counters.total_clicks || "0", 10);
  const maxLinksLimit = planDetails?.max_links || 100;

  return {
    organization: {
      organizationId: org.organization_id, // Send the UUID back to the frontend
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
};