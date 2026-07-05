import * as dashboardRepo from "../../repository/orgDashboard.repository.ts";
import { findOrgByOrganizationId } from "../../repository/organization.repository.ts";
import { findPlanByName } from "../../repository/subscriptionPlan.repository.ts";
import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

export const getDashboardSummary = async (organizationId: string) => {
  // 1. Ensure organizationid parameter exists
  if (!organizationId) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  // 2. Resolve organization context by its public UUID/String identifier
  const org = await findOrgByOrganizationId(organizationId);
  if (!org) {
    throw new AppError(ERRORS.ORGANIZATION_NOT_FOUND);
  }

  // Ensure internal numeric IDs are typed as numbers for downstream queries
  const internalOrgId = Number(org.id);

  // 3. Fetch the current plan details to build comparison quota progress bars
  const planDetails = await findPlanByName(org.current_plan || "FREE");

  // 4. Fire database calls concurrently using the internal numeric ID for fast index matching
  const [counters, topLinks, recentLinks, chartData] = await Promise.all([
    dashboardRepo.getDashboardCounters(internalOrgId),
    dashboardRepo.getTopPerformingLinks(internalOrgId),
    dashboardRepo.getRecentLinks(internalOrgId),
    dashboardRepo.getClickAnalyticsOverTime(internalOrgId, 7), // Last 7 days tracking
  ]);

  const totalLinksCreated = parseInt(counters.total_links, 10);
  const totalClicksAccumulated = parseInt(counters.total_clicks, 10);

  // 5. Structural map for frontend visualization
  return {
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
        limit: planDetails?.max_links || 100,
        percentage_used: Math.min(
          Math.round((totalLinksCreated / (planDetails?.max_links || 100)) * 100),
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