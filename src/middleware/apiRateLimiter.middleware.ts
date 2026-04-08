import type { Request,Response,NextFunction } from "express";
import redisClient from "../config/cache/redis.ts";
import { HTTP_STATUS, MESSAGES } from "../constants/index.ts";

export const apiRateLimiter = (limit: number, windowSec = 10) => {
  return async (req:Request, res:Response, next:NextFunction) => {
    try {
      const key =
        req.user?.userId || req.headers["x-api-key"] || req.ip;

      const redisKey = `rate:${key}`;

      const count = await redisClient.incr(redisKey);

      if (count === 1) {
        await redisClient.expire(redisKey, windowSec);
      }

      if (count > limit) {
        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          success: false,
          message: MESSAGES.RATE_LIMITED,
          limit,
        });
      }

      next();
    } catch (err) {
      next(); // fail open (important)
    }
  };
};