import {
  createSubscription,
  getActiveSubscription,
  deactivateSubscriptions
} from "../../repository/subscription.repository.ts";

import {
  findOrgByUser,
  createOrganization
} from "../../repository/organization.repository.ts";

//FORBIDDEN Imported findAllPlans alongside findPlanById
import { 
  findPlanById, 
  findPlanByPlanId,
  findAllPlans 
} from "../../repository/subscriptionPlan.repository.ts";

import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts";

const CACHE_TTL_PLANS = 60 * 60 * 24; // 24 hours for static plan catalogs
const CACHE_TTL_ACTIVE_SUB = 60 * 5; // 5 minutes for active organization subscriptions

export const getAllPlans = async () => {
  const cacheKey = "subscription:plans:all";

  //  Check Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  //  Fetch from DB
  const plans = await findAllPlans();

  //  Save to Cache
  redisClient.setEx(cacheKey, CACHE_TTL_PLANS, JSON.stringify(plans))
    .catch(err => console.error("Failed to cache all plans:", err));

  return plans;
};

// Purchase or upgrade a subscription plan
export const purchasePlan = async (
  userId: number,
  planId: string
) => {
  let org = await findOrgByUser(userId);

  if (!org) {
    org = await createOrganization(
      { name: `user-${userId}-org` },
      userId
    );
  }

  await deactivateSubscriptions(org.id);

  const plan = await findPlanByPlanId(planId);
  if (!plan) throw new Error("Invalid plan");

  const startDate = new Date();
  let endDate: Date | null = null;

  if (plan.cycle_type === "BILLING_CYCLE") {
    endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const subscription = await createSubscription(
    org.id,
    plan.id,
    startDate,
    endDate
  );

  // INVALIDATE CACHE: Ensure the user gets their new limits immediately
  await redisClient.del(`subscription:org:${org.id}:active`)
    .catch(err => console.error(`Failed to invalidate subscription cache for org ${org.id}:`, err));

  return {
    organization: org,
    subscription,
    plan
  };
};

// Get currently active subscription for an organization
export const getCurrentPlan = async (orgId: number) => {
  try {
    const cacheKey = `subscription:org:${orgId}:active`;

    // Check Cache
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    //  Fetch from DB
    const subscription = await getActiveSubscription(orgId);
    
    // Normalize return value to null if no record is found in the database
    const result = subscription ?? null;

    //  Save to Cache (including nulls to prevent DB hammering on orgs without subs)
    redisClient.setEx(cacheKey, CACHE_TTL_ACTIVE_SUB, JSON.stringify(result))
      .catch(err => console.error(`Failed to cache active subscription for org ${orgId}:`, err));

    return result;
  } catch (err) {
    // Intercept database failure and cast to an operational AppError
    throw new AppError({
      ...ERRORS.INTERNAL,
      message: `Failed to retrieve active subscription state for organization ID: ${orgId}`
    });
  }
};