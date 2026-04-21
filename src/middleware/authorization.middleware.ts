import { Permission } from "../constants/permissions.ts";
import { rolePermissions } from "../constants/rbac.ts";
import { HTTP_STATUS, MESSAGES } from "../constants/index.ts";
import { Role } from "../constants/roles.ts";
import type {Request,Response, NextFunction } from "express";

export const authorize = (...requiredPermissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.UNAUTHORIZED,
        });
      }

      const role = user.role as Role;
      const userPermissions = rolePermissions[role] ?? [];

      // Admin override
      if (role === Role.ADMIN) {
        return next();
      }

      const hasAccess = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasAccess) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
        });
      }

      return next();
    } catch {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};