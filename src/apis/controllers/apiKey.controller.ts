import type { Request, Response, NextFunction } from "express";

import {
    createApiKeyService,
    getApiKeysService,
    updateApiKeyService,
    revokeApiKeyService,
    deleteApiKeyService
} from "../../services/apikey/apiKey.service.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import { ERRORS, HTTP_STATUS, MESSAGES } from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";



// CREATE API KEY


export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.tenantId) {
            throw new AppError(ERRORS.UNAUTHORIZED);
        }

        const data = await createApiKeyService({
            organizationId: req.user.tenantId,
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
        if (!req.user?.tenantId) {
            throw new AppError(ERRORS.UNAUTHORIZED);
        }

        const { limit = 10, offset = 0 } = req.query;

        const keys = await getApiKeysService(
            Number(req.user.tenantId),
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
                pagination: {
                    limit: Number(limit),
                    offset: Number(offset)
                }
            }
        );
    } catch (err) {
        httpError(next, err, req);
    }
};



// UPDATE API KEY


export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.tenantId) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }
        const updated = await updateApiKeyService(
            Number(req.params.id),
            Number(req.user.tenantId),
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
        await revokeApiKeyService(Number(req.params.id),Number(req.user?.organizationId));

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


export const deleteApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await deleteApiKeyService(Number(req.params.id),Number(req.user?.organizationId));

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