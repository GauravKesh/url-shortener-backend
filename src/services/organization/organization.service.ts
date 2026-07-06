import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts"; // <-- Import Redis client

import {
  createOrganization,
  findOrgByOrganizationId,
  findOrgByUser,
  updateOrganization,
  deleteOrganization,
  getOrganizationCurrentPlan
} from "../../repository/organization.repository.ts";

const CACHE_TTL_ORG = 60 * 60; // 1 hour for organization details
const CACHE_TTL_PLAN = 60 * 60 * 24; // 24 hours for plan tags (invalidated on change)

// --- HELPER: Centralized Cache Invalidation ---
const invalidateOrgCaches = async (org: any, userId?: number) => {
  if (!org) return;
  try {
    // Invalidate by Public UUID
    if (org.organization_id) await redisClient.del(`org:publicId:${org.organization_id}`);
    
    // Invalidate by Internal Numeric ID (used for plan lookups and subscriptions)
    if (org.id) {
      await redisClient.del(`org:id:${org.id}`);
      await redisClient.del(`org:plan:${org.id}`);
    }
    
    // Invalidate by User ID (Shared with auth.service.ts)
    const uid = userId || org.owner_id;
    if (uid) await redisClient.del(`org:byUser:${uid}`);
    
  } catch (err) {
    console.error(`Failed to clear org caches for org ${org?.id}:`, err);
  }
};

/* get org by organizationid */
export const getOrganizationById = async (publicId: string) => {
  const cacheKey = `org:publicId:${publicId}`;

  //  Check Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  //  Fetch from DB
  const org = await findOrgByOrganizationId(publicId);
  if (!org) {
    throw new AppError(ERRORS.NOT_FOUND);
  }

  //  Save to Cache
  redisClient.setEx(cacheKey, CACHE_TTL_ORG, JSON.stringify(org))
    .catch(err => console.error("Failed to cache org by publicId:", err));

  return org;
};

/* get org of current user */
export const getMyOrganization = async (userId: number) => {
  const cacheKey = `org:byUser:${userId}`;

  //  Check Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  //  Fetch from DB
  const org = await findOrgByUser(userId);
  if (!org) {
    throw new AppError(ERRORS.NOT_FOUND);
  }

  //  Save to Cache
  redisClient.setEx(cacheKey, CACHE_TTL_ORG, JSON.stringify(org))
    .catch(err => console.error("Failed to cache org by userId:", err));

  return org;
};

/* create org (user becomes owner) */
export const createOrg = async (userId: number, name: string) => {
  const existing = await findOrgByUser(userId);

  if (existing) {
    return existing; // already has org
  }

  const org = await createOrganization({ name }, userId);

  // Invalidate any negative caches tied to this user
  await invalidateOrgCaches(org, userId);

  return org;
};

/* update org (only owner allowed) */
export const updateOrg = async (
  userId: number,
  organizationId: string,
  updates: { name?: string }
) => {
  const org = await findOrgByOrganizationId(organizationId);

  if (!org) {
    throw new AppError(ERRORS.NOT_FOUND);
  }   
  if (Number(org.owner_id) !== userId) {
    throw new AppError(ERRORS.FORBIDDEN);
  }

  const updated = await updateOrganization(organizationId, updates);
  
  // Clear stale data across the board
  await invalidateOrgCaches(updated, userId);

  return updated;
};

/* delete org */
export const removeOrg = async (userId: number, organizationId: string) => {
  const org = await findOrgByOrganizationId(organizationId);

  if (!org) {
    throw new AppError(ERRORS.NOT_FOUND);
  }
  
  // Fixed type mismatch risk: coerced owner_id to Number just in case DB returns string
  if (Number(org.owner_id) !== userId) {
    throw new AppError(ERRORS.FORBIDDEN);
  }

  await deleteOrganization(organizationId);
  await invalidateOrgCaches(org, userId);

  return true;
};

/**
 * Updates ONLY the organization's cached tier tag.
 * Acts as a secure, isolated gatekeeper for billing tier escalations.
 */
export const updateOrganizationPlanTag = async (
  orgPublicId: string,
  newPlanName: string
) => {
  if (!orgPublicId) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  const VALID_PLANS = ["FREE", "PRO", "ENTERPRISE"];
  if (!VALID_PLANS.includes(newPlanName.toUpperCase())) {
    throw new AppError(ERRORS.PLAN_NOT_FOUND);
  }

  const updatedOrg = await updateOrganization(orgPublicId, {
    current_plan: newPlanName.toUpperCase()
  });

  if (!updatedOrg) {
    throw new AppError(ERRORS.ORGANIZATION_NOT_FOUND);
  }

  // Critical: Clear caches so limits and dashboards update immediately
  await invalidateOrgCaches(updatedOrg);

  return updatedOrg;
};

export const getOrganizationPlan = async (organizationId: number) => {
  const cacheKey = `org:plan:${organizationId}`;

  //  Check Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return cached; // Returning plain string, no JSON.parse needed

  //  Fetch from DB
  const planName = await getOrganizationCurrentPlan(organizationId);
  if (!planName) {
    throw new AppError(ERRORS.ORGANIZATION_NOT_FOUND);
  }

  //  Save to Cache
  redisClient.setEx(cacheKey, CACHE_TTL_PLAN, planName)
    .catch(err => console.error(`Failed to cache plan for org ${organizationId}:`, err));

  return planName;
};