// backend/src/controllers/apiKey.controller.ts
import type { Request, Response, NextFunction } from "express";

import {
    createApiKeyService,
    getApiKeysService,
    updateApiKeyService,
    revokeApiKeyService,
    deleteApiKeyService
} from "../../services/apikey/apiKey.service.ts";

import { findOrgByUser } from "../../repository/organization.repository.ts"; // <-- Added to fetch correct org
import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import { ERRORS, HTTP_STATUS, MESSAGES } from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";


// Helper to get the correct organization integer ID for the current user
const getOrgIdForUser = async (userId: number | undefined | string) => {
    if (!userId) throw new AppError(ERRORS.FORBIDDEN);
    const org = await findOrgByUser(userId as number);
    if (!org) throw new AppError(ERRORS.FORBIDDEN, "Organization not found");
    return org.id; // Return the database integer ID
};

// CREATE API KEY
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = await getOrgIdForUser(req.user?.userId);

        const data = await createApiKeyService({
            organizationId: orgId,
            ...req.body
        });

        return httpResponse(
            req,
            res,
            HTTP_STATUS.CREATED,
            MESSAGES.API_KEY_CREATED,
            data
        );
    } catch (err) {
        httpError(next, err, req);
    }
};

// GET ALL API KEYS
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = await getOrgIdForUser(req.user?.userId);
        const { limit = 10, offset = 0 } = req.query;

        const keys = await getApiKeysService(
            orgId,
            Number(limit),
            Number(offset)
        );

        return httpResponse(
            req,
            res,
            HTTP_STATUS.OK,
            MESSAGES.API_KEYS_FETCHED,
            {
                items: keys,
                pagination: { limit: Number(limit), offset: Number(offset) }
            }
        );
    } catch (err) {
        httpError(next, err, req);
    }
};

// UPDATE API KEY
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = await getOrgIdForUser(req.user?.userId);

        const updated = await updateApiKeyService(
            String(req.params.apiKeyId),
            orgId,
            req.body
        );

        return httpResponse(
            req,
            res,
            HTTP_STATUS.OK,
            MESSAGES.API_KEY_UPDATED,
            updated
        );
    } catch (err) {
        httpError(next, err, req);
    }
};

// REVOKE API KEY
export const revoke = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = await getOrgIdForUser(req.user?.userId);

        await revokeApiKeyService(String(req.params.apiKeyId), orgId);

        return httpResponse(
            req,
            res,
            HTTP_STATUS.OK,
            MESSAGES.API_KEY_REVOKED
        );
    } catch (err) {
        httpError(next, err, req);
    }
};

// DELETE API KEY
export const deleteApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = await getOrgIdForUser(req.user?.userId);

        await deleteApiKeyService(String(req.params.apiKeyId), orgId);

        return httpResponse(
            req,
            res,
            HTTP_STATUS.OK,
            MESSAGES.API_KEY_DELETED
        );
    } catch (err) {
        httpError(next, err, req);
    }
};