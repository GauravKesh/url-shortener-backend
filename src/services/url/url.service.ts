
import {
    createUrl,
    getUrlsByUser,
    getUrlsByOrg,
    countUrlsByUser,
    countUrlsByOrg,
    findUrlById,
    updateUrl,
    deleteUrl,
    findUrl,
    incrementClicks,
} from "../../repository/url.repository.ts";

import config from "../../config/config.ts";
import redisClient from "../../config/cache/redis.ts";
import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import { generateShortCode } from "./generateShortCode.service.ts";
import { increment } from "../usage/usage.service.ts";

const CACHE_TTL = 60 * 5;

/*
  Create URL (handles alias logic)
*/
export const createUrlService = async ({
    originalUrl,
    shortCode,
    userId,
    organizationId,
}: any) => {

    if (!originalUrl) {
        throw new AppError(ERRORS.BAD_REQUEST);
    }

    if (shortCode) {
        shortCode = await generateShortCode(shortCode);
    } else {
        shortCode = await generateShortCode();
    }

    const url = await createUrl({
        shortCode,
        originalUrl,
        userId,
        organizationId,
    });

    await increment(organizationId, "links_created");

    return {
        shortUrl: url.short_code,
    };
};

export const createUrlServicePublic = async ({
    originalUrl,
    shortCode,
}: any) => {

    if (!originalUrl) {
        throw new AppError(ERRORS.BAD_REQUEST);
    }

    if (shortCode) {
        shortCode = await generateShortCode(shortCode);
    } else {
        shortCode = await generateShortCode();
    }

    const url = await createUrl({
        shortCode,
        originalUrl,
        userId: 1,
        organizationId: 1,
    });

    return {
        shortUrl: url.short_code,
    };
};

/*
  Get user URLs
*/
export const getUserUrlsService = async (userId: number, limit: number, offset: number) => {
    const [urls, total] = await Promise.all([
        getUrlsByUser({ userId, limit, offset }),
        countUrlsByUser(userId),
    ]);

    return { urls, total };
};

/*
  Get org URLs
*/
export const getOrgUrlsService = async (orgId: number, limit: number, offset: number) => {
    const [urls, total] = await Promise.all([
        getUrlsByOrg({ organizationId: orgId, limit, offset }),
        countUrlsByOrg(orgId),
    ]);

    return { urls, total };
};

/*
  Get one URL (with cache + auth check)
*/
export const getOneUrlService = async (id: number, user: any) => {
    const cacheKey = `url:id:${id}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const url = await findUrlById(id);
    if (!url) throw new AppError(ERRORS.URL_NOT_FOUND);

    if (
        url.user_id !== user.userId &&
        url.organization_id !== user.tenantId
    ) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(url));

    return url;
};

/*
  Update URL
*/
export const updateUrlService = async (id: number, user: any, updates: any) => {
    const existing = await findUrlById(id);
    if (!existing) throw new AppError(ERRORS.URL_NOT_FOUND);
    const existingUserId = Number(existing.user_id);
    const existingOrgId = Number(existing.organization_id);
    if (
        existingUserId !== user.userId &&
        existingOrgId !== user.tenantId
    ) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    const updated = await updateUrl(id, updates);
    if (!updated) throw new AppError(ERRORS.BAD_REQUEST);

    await redisClient.del(`url:id:${id}`);

    return updated;
};

/*
  Delete URL
*/
export const deleteUrlService = async (id: number, orgId: number) => {
    const success = await deleteUrl(id, orgId);
    if (!success) throw new AppError(ERRORS.URL_NOT_FOUND);

    await redisClient.del(`url:id:${id}`);
};

/*
  Redirect
*/
export const redirectService = async (shortCode: string) => {
    const cacheKey = `url:code:${shortCode}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
        const url = JSON.parse(cached);
        incrementClicks(url.id);
        return url;
    }

    const url = await findUrl(shortCode);
    if (!url) throw new AppError(ERRORS.URL_NOT_FOUND);

    if (url.expires_at && new Date(url.expires_at) < new Date()) {
        throw new AppError(ERRORS.URL_EXPIRED);
    }

    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(url));

    incrementClicks(url.id);

    return url;
};