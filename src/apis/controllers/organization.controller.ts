import type { Request, Response, NextFunction } from "express";

import * as orgService from "../../services/organization/organization.service.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import {
    HTTP_STATUS,
    MESSAGES,
    ERRORS
} from "../../constants/index.ts";

import { AppError } from "../../utils/AppError.ts";

export default {
    /* create org */
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;

            if (!userId) throw new AppError(ERRORS.FORBIDDEN);

            const { name } = req.body;

            if (!name) throw new AppError(ERRORS.BAD_REQUEST);

            const org = await orgService.createOrg(userId, name);

            return httpResponse(
                req,
                res,
                HTTP_STATUS.CREATED,
                MESSAGES.SUCCESS,
                { organization: org }
            );
        } catch (err) {
            httpError(next, err, req);
        }
    },

    /* get my org */
    me: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;

            if (!userId) throw new AppError(ERRORS.FORBIDDEN);

            const org = await orgService.getMyOrganization(userId);

            return httpResponse(
                req,
                res,
                HTTP_STATUS.OK,
                MESSAGES.SUCCESS,
                { organization: org }
            );
        } catch (err) {
            httpError(next, err, req);
        }
    },

    /* get org by public_id */
    getOne: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const publicId = req.params.id;

            const org = await orgService.getOrganizationById(publicId);

            return httpResponse(
                req,
                res,
                HTTP_STATUS.OK,
                MESSAGES.SUCCESS,
                { organization: org }
            );
        } catch (err) {
            httpError(next, err, req);
        }
    },

    /* update org */
    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            
            const publicId = req.params.id;

            if (!userId) throw new AppError(ERRORS.FORBIDDEN);

            const org = await orgService.updateOrg(userId, publicId, req.body);

            return httpResponse(
                req,
                res,
                HTTP_STATUS.OK,
                MESSAGES.SUCCESS,
                { organization: org }
            );
        } catch (err) {
            // //console.log(err);
            httpError(next, err, req);
        }
    },

    /* delete org */
    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            
            const publicId = req.params.id;

            if (!userId) throw new AppError(ERRORS.FORBIDDEN);

            await orgService.removeOrg(userId, publicId);

            return httpResponse(
                req,
                res,
                HTTP_STATUS.OK,
                MESSAGES.SUCCESS
            );
        } catch (err) {
            httpError(next, err, req);
        }
    }
};