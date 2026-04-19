import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

import {
    createOrganization,
    findOrgById,
    findOrgByUser,
    updateOrganization,
    deleteOrganization
} from "../../repository/organization.repository.ts";

/* get org by id */
export const getOrganizationById = async (orgId: number) => {
    const org = await findOrgById(orgId);

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

    const org = await createOrganization(name, userId);

    return org;
};

/* update org (only owner allowed) */
export const updateOrg = async (
    userId: number,
    orgId: number,
    updates: { name?: string }
) => {
    const org = await findOrgById(orgId);

    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }

    if (org.owner_id !== userId) {
        throw new AppError(ERRORS.UNAUTHORIZED);
    }

    const updated = await updateOrganization(orgId, updates);

    return updated;
};

/* delete org */
export const removeOrg = async (
    userId: number,
    orgId: number
) => {
    const org = await findOrgById(orgId);

    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }

    if (org.owner_id !== userId) {
        throw new AppError(ERRORS.UNAUTHORIZED);
    }

    await deleteOrganization(orgId);

    return true;
};