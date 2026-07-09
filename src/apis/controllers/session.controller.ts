import type { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth/auth.service.ts";
import httpResponse from "../../utils/httpResponse.ts";
import httpError from "../../utils/httpError.ts";
import { HTTP_STATUS, MESSAGES, ERRORS } from "../../constants/index.ts";
import { AppError } from "../../utils/AppError.ts";

export default {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(ERRORS.FORBIDDEN);
      }

      const status = (req.query.status as string) || "all";
      const allowed = ["all", "active", "inactive"];
      if (!allowed.includes(status)) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const sessions = await authService.listUserSessions(userId, status as any);
      const formatted = sessions.map((session: any) => ({
        sessionId: session.id,
        device: session.device,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        isActive: session.is_active,
        expiresAt: session.expires_at,
        lastUsedAt: session.last_used_at,
        createdAt: session.created_at,
      }));

      return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.SUCCESS, {
        sessions: formatted,
      });
    } catch (err) {
      httpError(next, err, req);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(ERRORS.FORBIDDEN);
      }

      const sessionId = Number(req.params.sessionId);
      if (!sessionId) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const { expiresAt, isActive } = req.body;

      const updated = await authService.updateUserSession(userId, sessionId, {
        expiresAt,
        isActive,
      });

      return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.SUCCESS, {
        session: {
          sessionId: updated.id,
          device: updated.device,
          ipAddress: updated.ip_address,
          userAgent: updated.user_agent,
          isActive: updated.is_active,
          expiresAt: updated.expires_at,
          lastUsedAt: updated.last_used_at,
          createdAt: updated.created_at,
        },
      });
    } catch (err) {
      httpError(next, err, req);
    }
  },

  revoke: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(ERRORS.FORBIDDEN);
      }

      const sessionId = Number(req.params.sessionId);
      if (!sessionId) {
        throw new AppError(ERRORS.BAD_REQUEST);
      }

      const updated = await authService.updateUserSession(userId, sessionId, {
        isActive: false,
      });

      return httpResponse(req, res, HTTP_STATUS.OK, MESSAGES.SUCCESS, {
        session: {
          sessionId: updated.id,
          device: updated.device,
          ipAddress: updated.ip_address,
          userAgent: updated.user_agent,
          isActive: updated.is_active,
          expiresAt: updated.expires_at,
          lastUsedAt: updated.last_used_at,
          createdAt: updated.created_at,
        },
      });
    } catch (err) {
      httpError(next, err, req);
    }
  },
};
