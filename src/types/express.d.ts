import "express";
import { Role } from "../constants/roles";

export interface AuthUser {
  userId?: number;
  organizationId?: number;
  tenantId?: number;
  role?: Role;
  authType?: "JWT" | "API_KEY" | "SESSION";
}

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    user?: AuthUser;
    apiKey?: string;
  }
}

export {};