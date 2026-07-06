
import {
    createUrl,
    getUrlsByUser,
    getUrlsByOrg,
    countUrlsByUser,
    countUrlsByOrg,
    findUrlById,
    findUrlByUrlId,
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
import { enforceLinkCreationLimit } from "../subscription/enforcePlanLimits.ts";
import { findDomainByDomainId } from "../../repository/domain.repository.ts";

const CACHE_TTL = 60 * 5;

/*
  Create URL (handles alias logic)
*/
export const createUrlService = async ({
    originalUrl,
    shortCode,
    userId,
    organizationId,
    domainId,
    expiresAt,
}: any) => {

    await enforceLinkCreationLimit(organizationId);

    if (!originalUrl) {
        throw new AppError(ERRORS.BAD_REQUEST);
    }

    const resolvedDomainId = domainId
        ? Number((await findDomainByDomainId(domainId, organizationId))?.id)
        : null;

    if (domainId && !resolvedDomainId) {
        throw new AppError(ERRORS.NOT_FOUND);
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
        domainId: resolvedDomainId,
        expiresAt,
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
export const getOneUrlService = async (urlId: string, user: any) => {
    const cacheKey = `url:urlId:${urlId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const url = await findUrlByUrlId(urlId);
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
export const updateUrlService = async (urlId: string, user: any, updates: any) => {
    const existing = await findUrlByUrlId(urlId);
    if (!existing) throw new AppError(ERRORS.URL_NOT_FOUND);
    const existingUserId = Number(existing.user_id);
    const existingOrgId = Number(existing.organization_id);
    if (
        existingUserId !== user.userId &&
        existingOrgId !== user.tenantId
    ) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    const normalizedUpdates = { ...updates };

    if (normalizedUpdates.domainId === null) {
        normalizedUpdates.domain_id = null;
        delete normalizedUpdates.domainId;
    } else if (normalizedUpdates.domainId !== undefined) {
        const domain = await findDomainByDomainId(
            String(normalizedUpdates.domainId),
            existingOrgId
        );

        if (!domain) {
            throw new AppError(ERRORS.NOT_FOUND);
        }

        normalizedUpdates.domain_id = Number(domain.id);
        delete normalizedUpdates.domainId;
    }
    }

    const updated = await updateUrl(urlId, normalizedUpdates);
    if (!updated) throw new AppError(ERRORS.BAD_REQUEST);

    await redisClient.del(`url:urlId:${urlId}`);

    return updated;
};

/*
  Delete URL
*/
export const deleteUrlService = async (urlId: string, orgId: number) => {
    const success = await deleteUrl(urlId, orgId);
    if (!success) throw new AppError(ERRORS.URL_NOT_FOUND);

    await redisClient.del(`url:urlId:${urlId}`);
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