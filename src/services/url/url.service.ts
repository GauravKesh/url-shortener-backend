
import {
    createUrl,
    isShortCodeTaken,
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

import redisClient from "../../config/cache/redis.ts";
import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

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
      console.log(originalUrl,
    shortCode,
    userId,
    organizationId,);
    if (!originalUrl) {
        throw new AppError(ERRORS.BAD_REQUEST);
    }

  


    if (shortCode) {
        const exists = await isShortCodeTaken(shortCode);
        if (exists) throw new AppError(ERRORS.ALIAS_TAKEN);
    } else {
        throw new AppError(ERRORS.BAD_REQUEST); // plug generator here later
    }

    return createUrl({
        shortCode,
        originalUrl,
        userId,
        organizationId,
    });
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

    if (
        existing.user_id !== user.userId &&
        existing.organization_id !== user.tenantId
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