import { Role } from "./roles.ts";
import { Permission } from "./permissions.ts";

//  Role → Permissions mapping
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.URL_CREATE,
    Permission.URL_READ,
    Permission.URL_UPDATE,
    Permission.URL_DELETE,
    Permission.URL_ANALYTICS,
    Permission.USER_MANAGE,
    Permission.SYSTEM_ADMIN,
  ],

  [Role.USER]: [
    Permission.URL_CREATE,
    Permission.URL_READ,
    Permission.URL_UPDATE,
    Permission.URL_DELETE,
    Permission.URL_ANALYTICS,
  ],

  [Role.GUEST]: [
    Permission.URL_READ,
  ],
};

//  helper
export const hasPermission = (
  role: Role,
  permission: Permission
): boolean => {
  return rolePermissions[role]?.includes(permission);
};