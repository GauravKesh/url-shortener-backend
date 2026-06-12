import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

import {
    createOrganization,
    findOrgByPublicId,
    findOrgByUser,
    updateOrganization,
    deleteOrganization
} from "../../repository/organization.repository.ts";

/* get org by public_id */
export const getOrganizationById = async (publicId: string) => {
    const org = await findOrgByPublicId(publicId);

    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }

    return {
    ...org,
    id: Number(org.id),
    owner_id: Number(org.owner_id),
  };
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
    publicId: string,
    updates: { name?: string }
) => {

    const org = await findOrgByPublicId(publicId);

    // console.log(org);
    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }   
    // console.log(typeof org.owner_id, typeof userId);
    // console.log(Number(org.owner_id) !== userId);
    if (Number(org.owner_id) !== userId) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    const updated = await updateOrganization(publicId, updates);
    console.log(updated);

    return updated;
};

/* delete org */
export const removeOrg = async (
    userId: number,
    publicId: string
) => {
    const org = await findOrgByPublicId(publicId);

    if (!org) {
        throw new AppError(ERRORS.NOT_FOUND);
    }

    if (org.owner_id !== userId) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    await deleteOrganization(publicId);

    return true;
};