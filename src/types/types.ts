import type { Request } from "express";

/**
 * Authenticated Request
 */
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    organizationId?: number;
  };
}

/**
 * API Key Request
 */
export interface ApiKeyRequest extends Request {
  organization_id?: number;
}

/**
 * Standard API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | undefined;
  requestId?: string | undefined;
}

/**
 * Error Response
 */
export interface ApiError {
  success: false;
  message: string;
  error?: any;
}

export interface BaseRequest extends Request {
  requestId?: string;
}