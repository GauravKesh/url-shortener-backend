import {
  createSubscription,
  getActiveSubscription,
  deactivateSubscriptions
} from "../../repository/subscription.repository.ts";

import {
  findOrgByUser,
  createOrganization
} from "../../repository/organization.repository.ts";

import { findPlanById } from "../../repository/subscriptionPlan.repository.ts";

// Purchase or upgrade a subscription plan
export const purchasePlan = async (
  userId: number,
  planId: number
) => {
  // Ensure user has an organization (create if not)
  let org = await findOrgByUser(userId);

  if (!org) {
    org = await createOrganization(
      `user-${userId}-org`,
      userId
    );
  }

  // Deactivate any existing active subscriptions
  await deactivateSubscriptions(org.id);

  // Fetch selected plan details
  const plan = await findPlanById(planId);
  if (!plan) throw new Error("Invalid plan");

  // Initialize subscription start date
  const startDate = new Date();

  // Determine end date based on billing cycle
  let endDate: Date | null = null;

  if (plan.cycle_type === "BILLING_CYCLE") {
    endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // +1 month cycle
  }

  // Create new subscription entry
  const subscription = await createSubscription(
    org.id,
    planId,
    startDate,
    endDate
  );

  return {
    organization: org,
    subscription,
    plan
  };
};

// Get currently active subscription for an organization
export const getCurrentPlan = async (orgId: number) => {
  return await getActiveSubscription(orgId);
};