import "express";
import { Role } from "../constants/roles";

// Shape of the API key row from your database/service
export interface ApiKeyData {
  id?: number;
  api_key_id?: string;
  organization_id?: number;
  key_hash?: string;
  name?: string | null;
  revoked?: boolean;
  rate_limit_per_min?: number | null;
  max_links?: number | null;
  max_expiry_days?: number | null;
  last_used_at?: Date | null;
  created_at?: Date;
}

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
    apiKey?: ApiKeyData;
    clientIp?:string;
  }
}

export {};