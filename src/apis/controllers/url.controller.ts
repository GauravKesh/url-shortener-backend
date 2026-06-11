import type { Request, Response, NextFunction } from "express";

import {
  createUrlService,
  getUserUrlsService,
  getOrgUrlsService,
  getOneUrlService,
  updateUrlService,
  deleteUrlService,
  redirectService,
  createUrlServicePublic,
} from "../../services/url/url.service.ts";

import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";

import { ERRORS, HTTP_STATUS, MESSAGES } from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";

/*
  Create
*/
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {


    if (!req.user?.userId || !req.user?.tenantId) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }



    const data = await createUrlService({
      ...req.body,
      userId: req.user.userId,
      organizationId: req.user.tenantId,
    });

    return httpResponse(req, res, HTTP_STATUS.CREATED, MESSAGES.URL_CREATED, data.shortUrl);
  } catch (err) {
    httpError(next, err, req);
  }
};

export const createPublic = async (req: Request, res: Response, next: NextFunction) => {
  try {



    const data = await createUrlServicePublic({
      ...req.body,
    });

    return httpResponse(req, res, HTTP_STATUS.CREATED, MESSAGES.URL_CREATED, data.shortUrl);
  } catch (err) {
    httpError(next, err, req);
  }
};

/*
  Get user URLs
*/
export const getUserUrls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const { urls, total } = await getUserUrlsService(
      Number(req.user?.userId),
      Number(limit),
      Number(offset)
    );

    return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.URL_FETCHED, {
      items: urls,
      pagination: { total, limit: Number(limit), offset: Number(offset) },
    });
  } catch (err) {
    httpError(next, err, req);
  }
};

/*
  Get org URLs
*/
export const getOrgUrls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const { urls, total } = await getOrgUrlsService(
      Number(req.user?.tenantId),
      Number(limit),
      Number(offset)
    );

    return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.URL_FETCHED, {
      items: urls,
      pagination: { total, limit: Number(limit), offset: Number(offset) },
    });
  } catch (err) {
    httpError(next, err, req);
  }
};

/*
  Get one
*/
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await getOneUrlService(Number(req.params.id), req.user);

    return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.URL_FETCHED, url);
  } catch (err) {
    httpError(next, err, req);
  }
};

/*
  Update
*/
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await updateUrlService(
      Number(req.params.id),
      req.user,
      req.body
    );

    return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.URL_UPDATED, updated);
  } catch (err) {
    httpError(next, err, req);
  }
};

/*
  Delete
*/
export const deleteUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteUrlService(
      Number(req?.params.id),
      Number(req?.user?.tenantId)
    );

    return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.URL_DELETED);
  } catch (err) {
    httpError(next, err, req);
  }
};

/*
  Redirect
*/
export const redirect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await redirectService(req.params.shortCode);

    return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.URL_FETCHED,url.original_url);
  } catch (err) {
    httpError(next, err, req);
  }
};