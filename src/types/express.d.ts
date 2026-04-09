import "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    user?: {
      userId?: number;
      organizationId?: number;
      role?: string;
      tenantId?: number;
      authType?: string
    };
    apiKey?: string

  }
}