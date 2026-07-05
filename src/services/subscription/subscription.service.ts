// subscription.service.ts

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

export const getAllPlans = async () => {
  return await findAllPlans();
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

  return {
    organization: org,
    subscription,
    plan
  };
};

// Get currently active subscription for an organization
export const getCurrentPlan = async (orgId: number) => {
  try {
    const subscription = await getActiveSubscription(orgId);
    //console.log("sucbscriptim daya",subscription);
    
    // Normalize return value to null if no record is found in the database
    return subscription ?? null;
  } catch (err) {
    // Intercept database failure and cast to an operational AppError
    throw new AppError({
      ...ERRORS.INTERNAL,
      message: `Failed to retrieve active subscription state for organization ID: ${orgId}`
    });
  }
};