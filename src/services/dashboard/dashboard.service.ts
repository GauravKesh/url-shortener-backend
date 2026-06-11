import {
  getUserDashboardStats,
  getOrgDashboardStats,
  getRecentUrls as getRecentUrlsRepo,
  getTopUrls as getTopUrlsRepo,
} from "../../repository/dashboard.repository.ts";

export const getSummary = async ({
  userId,
  organizationId,
}: {
  userId: number;
  organizationId: number;
}) => {
  const [userStats, orgStats] = await Promise.all([
    getUserDashboardStats(userId),
    getOrgDashboardStats(organizationId),
  ]);

  return {
    totalUrls: orgStats.total_urls,
    totalClicks: orgStats.total_clicks,
    userUrls: userStats.total_urls,
    userClicks: userStats.total_clicks,
  };
};

export const getRecentUrls = async ({
  organizationId,
}: {
  organizationId: number;
}) => {
  return getRecentUrlsRepo(organizationId);
};

export const getTopUrls = async ({
  organizationId,
}: {
  organizationId: number;
}) => {
  return getTopUrlsRepo(organizationId);
};