import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

import {
    createOrganization,
  findOrgByOrganizationId,
    findOrgByUser,
    updateOrganization,
    deleteOrganization,
    getOrganizationCurrentPlan
} from "../../repository/organization.repository.ts";

/* get org by organizationid */
export const getOrganizationById = async (publicId: string) => {
  const org = await findOrgByOrganizationId(publicId);

    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }

    return org;
};

/* get org of current user */
export const getMyOrganization = async (userId: number) => {
    const org = await findOrgByUser(userId);

    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }

    return org;
};

/* create org (user becomes owner) */
export const createOrg = async (
    userId: number,
    name: string
) => {
    const existing = await findOrgByUser(userId);

    if (existing) {
        return existing; // already has org
    }

    const org = await createOrganization({name}, userId);

    return org;
};

/* update org (only owner allowed) */
export const updateOrg = async (
    userId: number,
  organizationId: string,
    updates: { name?: string }
) => {

  const org = await findOrgByOrganizationId(organizationId);

    // //console.log(org);
    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }   
    if (Number(org.owner_id) !== userId) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    const updated = await updateOrganization(organizationId, updates);
    //console.log(updated);

    return updated;
};

/* delete org */
export const removeOrg = async (
    userId: number,
  organizationId: string
) => {
  const org = await findOrgByOrganizationId(organizationId);

    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }

    if (org.owner_id !== userId) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    await deleteOrganization(organizationId);

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
  // 1. Validate incoming identification presence
  if (!orgPublicId) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  // 2. Enforce rigid string whitelisting against database configuration constraints
  const VALID_PLANS = ["FREE", "PRO", "ENTERPRISE"];
  if (!VALID_PLANS.includes(newPlanName.toUpperCase())) {
    throw new AppError(ERRORS.PLAN_NOT_FOUND);
  }

  // 3. Execute the database transaction targeting ONLY the current_plan column
  const updatedOrg = await updateOrganization(orgPublicId, {
    current_plan: newPlanName.toUpperCase()
  });

  // 4. Handle unexpected downstream execution failures safely
  if (!updatedOrg) {
    throw new AppError(ERRORS.ORGANIZATION_NOT_FOUND);
  }

  return updatedOrg;
};


// organization.service.ts

export const getOrganizationPlan = async (
  organizationId:number
) => {
  const planName =
    await getOrganizationCurrentPlan(organizationId);

  if (!planName) {
    throw new AppError(ERRORS.ORGANIZATION_NOT_FOUND);
  }

  return planName;
};