// types/organization.ts

export interface OrganizationAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface OrganizationSettings {
  allow_public_api?: boolean;
  require_email_verification?: boolean;
  default_link_expiry_days?: number;
  enable_analytics?: boolean;

  [key: string]: unknown;
}

export interface OrganizationCustomLimits {
  max_links?: number;
  max_api_keys?: number;
  rate_limit_per_min?: number;
  max_expiry_days?: number;

  [key: string]: unknown;
}

export interface Organization {
  id: string | number;
  organization_id: string;

  name: string;
  display_name?: string;
  slug?: string;
  description?: string;

  owner_id: string | number;

  website_url?: string;
  logo_url?: string;

  support_email?: string;
  phone_number?: string;

  timezone?: string;
  country?: string;

  address?: OrganizationAddress;

  settings?: OrganizationSettings;

  metadata?: Record<string, unknown>;

  custom_limits?: OrganizationCustomLimits;

  is_active?: boolean;
  is_verified?: boolean;

  require_sso?: boolean;
  enforce_2fa?: boolean;

  deleted_at?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface CreateOrganizationPayload {
  name: string;

  display_name?: string;
  slug?: string;
  description?: string;

  website_url?: string;
  logo_url?: string;

  support_email?: string;
  phone_number?: string;

  timezone?: string;
  country?: string;

  address?: OrganizationAddress;

  settings?: OrganizationSettings;

  metadata?: Record<string, unknown>;
}

export interface UpdateOrganizationPayload {
  name?: string;

  display_name?: string;
  slug?: string;
  description?: string;

  website_url?: string;
  logo_url?: string;

  support_email?: string;
  phone_number?: string;

  timezone?: string;
  country?: string;

  address?: OrganizationAddress;

  settings?: OrganizationSettings;

  metadata?: Record<string, unknown>;

  custom_limits?: OrganizationCustomLimits;

  is_active?: boolean;
  is_verified?: boolean;

  require_sso?: boolean;
  enforce_2fa?: boolean;
}