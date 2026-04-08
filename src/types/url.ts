export interface UrlRow {
  id: number;
  short_code: string;
  original_url: string;
  user_id: number;
  organization_id: number;
  domain_id: number | null;
  expires_at: Date | null;
  clicks: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUrlData {
  shortCode: string;
  originalUrl: string;
  userId: number;
  organizationId: number;
  domainId?: number | null;
  expiresAt?: Date | null;
}

export interface GetUrlsOptions {
  userId?: number;
  organizationId?: number;
  mode?: "OR" | "AND";
  limit?: number;
  offset?: number;
}