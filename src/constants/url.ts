export const ALLOWED_UPDATE_FIELDS = [
  "original_url",
  "short_code",
  "domain_id",
  "expires_at",
] as const;

export type AllowedUpdateField = typeof ALLOWED_UPDATE_FIELDS[number];

export const ALLOWED_UPDATE_SET = new Set<AllowedUpdateField>(
  ALLOWED_UPDATE_FIELDS
);