import { Permission } from "../constants/permissions.ts";
import { rolePermissions } from "../constants/rbac.ts";
import { HTTP_STATUS, MESSAGES } from "../constants/index.ts";
import { Role } from "../constants/roles.ts";

export const authorize = (...requiredPermissions: Permission[]) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.UNAUTHORIZED,
        });
      }

      const role: Role = user.role;
      const userPermissions = rolePermissions[role] || [];

      // 🔥 admin override
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
    } catch (err) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};