export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRouteContract {
  method: HttpMethod;
  path: string;
  auth: "public" | "required" | "bearer-or-cookie" | "refresh-cookie";
  requestBody?: string[];
  queryParams?: string[];
  returns: string[];
  notes?: string[];
}

export const apiBasePath = "/api/v1";

export const apiRoutes: ApiRouteContract[] = [
  {
    method: "GET",
    path: "/health",
    auth: "public",
    returns: ["status", "uptime", "timestamp"],
  },
  {
    method: "GET",
    path: "/health/ready",
    auth: "public",
    returns: ["status", "services", "timestamp"],
  },
  {
    method: "GET",
    path: "/health/full",
    auth: "public",
    returns: ["status", "services", "uptime", "timestamp"],
  },
  {
    method: "POST",
    path: "/auth/signup",
    auth: "public",
    requestBody: ["email", "password", "organization_name?"],
    returns: ["user", "organization", "accessToken"],
    notes: ["Sets refreshToken cookie", "Returns accessToken in JSON"],
  },
  {
    method: "POST",
    path: "/auth/login",
    auth: "public",
    requestBody: ["email", "password"],
    returns: ["user", "organization"],
    notes: ["Sets refreshToken and accessToken cookies"],
  },
  {
    method: "POST",
    path: "/auth/logout",
    auth: "public",
    returns: [],
    notes: ["Clears refreshToken cookie when present"],
  },
  {
    method: "POST",
    path: "/auth/refresh",
    auth: "refresh-cookie",
    returns: ["accessToken"],
    notes: ["Rotates refresh token and access token cookies"],
  },
  {
    method: "GET",
    path: "/auth/me",
    auth: "bearer-or-cookie",
    returns: ["user"],
    notes: ["Returns session context, not the full user profile"],
  },
  {
    method: "GET",
    path: "/user/me",
    auth: "required",
    returns: ["user"],
  },
  {
    method: "PATCH",
    path: "/user/me",
    auth: "required",
    requestBody: ["name?", "avatar_url?"],
    returns: ["user"],
  },
  {
    method: "POST",
    path: "/user/change-password",
    auth: "required",
    requestBody: ["oldPassword", "newPassword"],
    returns: [],
  },
  {
    method: "DELETE",
    path: "/user/me",
    auth: "required",
    returns: [],
  },
  {
    method: "POST",
    path: "/org",
    auth: "required",
    requestBody: ["name"],
    returns: ["organization"],
  },
  {
    method: "GET",
    path: "/org/me",
    auth: "required",
    returns: ["organization"],
  },
  {
    method: "GET",
    path: "/org/:id",
    auth: "required",
    returns: ["organization"],
  },
  {
    method: "PATCH",
    path: "/org/:id",
    auth: "required",
    requestBody: ["name?"],
    returns: ["organization"],
  },
  {
    method: "DELETE",
    path: "/org/:id",
    auth: "required",
    returns: [],
  },
  {
    method: "POST",
    path: "/subscription/purchase",
    auth: "required",
    requestBody: ["planId"],
    returns: ["organization", "subscription", "plan"],
  },
  {
    method: "GET",
    path: "/subscription/current",
    auth: "required",
    returns: ["subscription"],
    notes: ["Active subscription joined with plan fields"],
  },
  {
    method: "GET",
    path: "/usage/current",
    auth: "required",
    returns: ["usage"],
  },
  {
    method: "POST",
    path: "/apikey",
    auth: "required",
    requestBody: ["name?", "rateLimitPerMin?", "maxLinks?", "maxExpiryDays?"],
    returns: ["apiKey", "data"],
    notes: ["Raw API key is returned only once"],
  },
  {
    method: "GET",
    path: "/apikey",
    auth: "required",
    queryParams: ["limit?", "offset?"],
    returns: ["items", "pagination"],
    notes: ["Pagination currently includes limit and offset only"],
  },
  {
    method: "PATCH",
    path: "/apikey/:id",
    auth: "required",
    requestBody: ["name?", "rate_limit_per_min?", "max_links?", "max_expiry_days?"],
    returns: ["sanitized api key row"],
    notes: ["key_hash is not returned"],
  },
  {
    method: "POST",
    path: "/apikey/:id/revoke",
    auth: "required",
    returns: [],
  },
  {
    method: "DELETE",
    path: "/apikey/:id",
    auth: "required",
    returns: [],
  },
  {
    method: "GET",
    path: "/url/r/:shortCode",
    auth: "public",
    returns: ["302 redirect"],
    notes: ["Redirects to the original URL and does not return JSON on success"],
  },
  {
    method: "POST",
    path: "/url/create",
    auth: "required",
    requestBody: ["originalUrl", "shortCode?", "domainId?", "expiresAt?"],
    returns: ["shortUrl"],
    notes: ["Request body is camelCase", "Response returns only the generated short code"],
  },
  {
    method: "GET",
    path: "/url/user",
    auth: "required",
    queryParams: ["limit?", "offset?"],
    returns: ["items", "pagination"],
  },
  {
    method: "GET",
    path: "/url/org",
    auth: "required",
    queryParams: ["limit?", "offset?"],
    returns: ["items", "pagination"],
  },
  {
    method: "GET",
    path: "/url/:id",
    auth: "required",
    returns: ["url row"],
  },
  {
    method: "PUT",
    path: "/url/:id",
    auth: "required",
    requestBody: ["original_url?", "short_code?", "domain_id?", "expires_at?"],
    returns: ["updated url row"],
    notes: ["Request body is snake_case because the service whitelists those fields"],
  },
  {
    method: "DELETE",
    path: "/url/:id",
    auth: "required",
    returns: [],
  },
];

export const apiResponseEnvelope = {
  success: true,
  requestId: "req_123abc",
  message: "Operation successful",
  data: {},
};

export const apiErrorEnvelope = {
  success: false,
  requestId: "req_123abc",
  code: "AUTH_004",
  message: "Unauthorized",
};