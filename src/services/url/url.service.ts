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

// --- Interfaces for Type Safety ---

interface CreateUrlDto {
    originalUrl: string;
    shortCode?: string;
    userId: number;
    organizationId: number;
    domainId?: string | number;
    expiresAt?: Date | string|null;
}

interface CreateUrlPublicDto {
    originalUrl: string;
    shortCode?: string;
}

interface UserAuthPayload {
    userId: number;
    tenantId: number;
}

interface UpdateUrlDto {
    domainId?: string | number | null;
    domain_id?: number | null;
    [key: string]: any; // Allows other fields to be updated
}

// --- Services ---

const invalidateDashboardCaches = async (organizationId: number, userId?: number) => {
    try {
        await redisClient.del(`dashboard:recent:org:${organizationId}`);
        await redisClient.del(`dashboard:top:org:${organizationId}`);
        if (userId) {
            await redisClient.del(`dashboard:summary:org:${organizationId}:user:${userId}`);
        }
        // Invalidate the generic org dashboard we made earlier too
        await redisClient.del(`dashboard:org:${organizationId}`);
    } catch (error) {
        console.error("Failed to invalidate dashboard caches", error);
    }
};

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
}: CreateUrlDto) => {

    await enforceLinkCreationLimit(organizationId);

    if (!originalUrl) {
        throw new AppError(ERRORS.BAD_REQUEST);
    }

    let resolvedDomainId = null;

    // Cleaner and safer domain resolution
    if (domainId) {
        const domain = await findDomainByDomainId(String(domainId), organizationId);
        if (!domain) {
            throw new AppError(ERRORS.NOT_FOUND);
        }
        resolvedDomainId = Number(domain.id);
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

    await invalidateDashboardCaches(organizationId, userId);

    return {
        shortUrl: url.short_code,
    };
};

export const createUrlServicePublic = async ({
    originalUrl,
    shortCode,
}: CreateUrlPublicDto) => {

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
        userId: 1, // Defaulting to public/system user
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
export const getOneUrlService = async (urlId: string, user:any) => {
    const cacheKey = `url:urlId:${urlId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const url = await findUrlByUrlId(urlId);
    if (!url) throw new AppError(ERRORS.URL_NOT_FOUND);

    if (
        Number(url.user_id) !== user.userId &&
        Number(url.organization_id) !== user.tenantId
    ) {
        throw new AppError(ERRORS.FORBIDDEN);
    }

    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(url));

    return url;
};

/*
  Update URL
*/
export const updateUrlService = async (urlId: string, user:any, updates: UpdateUrlDto) => {
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

    const updated = await updateUrl(urlId, normalizedUpdates);
    if (!updated) throw new AppError(ERRORS.BAD_REQUEST);

    // Invalidate BOTH caches to prevent stale redirects
    await redisClient.del(`url:urlId:${urlId}`);
    await redisClient.del(`url:code:${existing.short_code}`);

    return updated;
};

/*
  Delete URL
*/
export const deleteUrlService = async (urlId: string, orgId: number) => {
    // Fetch the URL first to get the short_code for cache invalidation
    const existing = await findUrlByUrlId(urlId);
    if (!existing) throw new AppError(ERRORS.URL_NOT_FOUND);

    const success = await deleteUrl(urlId, orgId);
    if (!success) throw new AppError(ERRORS.URL_NOT_FOUND);

    await invalidateDashboardCaches(orgId);

    // Invalidate BOTH caches
    await redisClient.del(`url:urlId:${urlId}`);
    await redisClient.del(`url:code:${existing.short_code}`);
};

/*
  Redirect
*/
export const redirectService = async (shortCode: string) => {
    const cacheKey = `url:code:${shortCode}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
        const url = JSON.parse(cached);
        
        //  Check expiration even if it's cached!
        if (url.expires_at && new Date(url.expires_at) < new Date()) {
            throw new AppError(ERRORS.URL_EXPIRED);
        }

        incrementClicks(url.id).catch(err => console.error(`Failed to increment clicks for cached URL ${url.id}:`, err));
        return url;
    }

    const url = await findUrl(shortCode);
    if (!url) throw new AppError(ERRORS.URL_NOT_FOUND);

    if (url.expires_at && new Date(url.expires_at) < new Date()) {
        throw new AppError(ERRORS.URL_EXPIRED);
    }

    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(url));
    incrementClicks(url.id).catch(err => console.error(`Failed to increment clicks for URL ${url.id}:`, err));

    return url;
};