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
    path: "/auth/request-password-reset",
    auth: "public",
    requestBody: ["email"],
    returns: ["message"],
    notes: ["Sends password reset email (dev: resetUrl returned)"],
  },
  {
    method: "POST",
    path: "/auth/reset-password",
    auth: "public",
    requestBody: ["token", "newPassword"],
    returns: ["message"],
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
    method: "GET",
    path: "/sessions",
    auth: "required",
    queryParams: ["status?"],
    returns: ["sessions"],
    notes: ["List active/inactive sessions for the current user"],
  },
  {
    method: "PATCH",
    path: "/sessions/:sessionId",
    auth: "required",
    requestBody: ["expiresAt?"],
    returns: ["session"],
    notes: ["Update session metadata (expiry, active flag)"],
  },
  {
    method: "POST",
    path: "/sessions/:sessionId/revoke",
    auth: "required",
    returns: [],
    notes: ["Revoke a specific session (log out other device)"]
  },
  {
    method: "GET",
    path: "/users/login-activity",
    auth: "required",
    queryParams: ["limit?","offset?","since?"],
    returns: ["activities"],
    notes: ["Returns recent login activity for the authenticated user in structured form for security auditing"]
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
    path: "/org/:organizationId",
    auth: "required",
    returns: ["organization"],
  },
  {
    method: "PATCH",
    path: "/org/:organizationId",
    auth: "required",
    requestBody: ["name?"],
    returns: ["organization"],
  },
  {
    method: "DELETE",
    path: "/org/:organizationId",
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
    path: "/subscription/plans",
    auth: "public",
    returns: ["plans"],
    notes: ["Public list of available subscription plans"],
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
    path: "/apikey/:apiKeyId",
    auth: "required",
    requestBody: ["name?", "rate_limit_per_min?", "max_links?", "max_expiry_days?"],
    returns: ["sanitized api key row"],
    notes: ["key_hash is not returned"],
  },
  {
    method: "POST",
    path: "/apikey/:apiKeyId/revoke",
    auth: "required",
    returns: [],
  },
  {
    method: "DELETE",
    path: "/apikey/:apiKeyId",
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
    path: "/url/:urlId",
    auth: "required",
    returns: ["url row"],
  },
  {
    method: "PUT",
    path: "/url/:urlId",
    auth: "required",
    requestBody: ["originalUrl?", "shortCode?", "domainId?", "expiresAt?"],
    returns: ["updated url row"],
    notes: ["Request body is camelCase; the service resolves domainId internally before writing domain_id"],
  },
  {
    method: "DELETE",
    path: "/url/:urlId",
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

export const API = {
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    REQUEST_PASSWORD_RESET: "/auth/request-password-reset",
    RESET_PASSWORD: "/auth/reset-password",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },

  USER: {
    ME: "/user/me",
    UPDATE: "/user/me",
    CHANGE_PASSWORD: "/user/change-password",
    DELETE: "/user/me",
  },

  ORG: {
    CREATE: "/org",
    ME: "/org/me",
    BY_ID: (id: string) => `/org/${id}`,
  },

  ORG_DASHBOARD: {
    SUMMARY: (orgPublicId: string) => `/org/dashboard/summary/${orgPublicId}`,
  },

  SUBSCRIPTION: {
    PURCHASE: "/subscription/purchase",
    CURRENT: "/subscription/current",
    PLANS: "/subscription/plans",
  },

  USAGE: {
    CURRENT: "/usage/current",
  },

  API_KEY: {
    CREATE: "/apikey",
    LIST: "/apikey",
    UPDATE: (id: string) => `/apikey/${id}`,
    REVOKE: (id: string) => `/apikey/${id}/revoke`,
    DELETE: (id: string) => `/apikey/${id}`,
  },

  URL: {
    CREATE: "/url/create",
    PUBLIC_CREATE: "/url/create/public",
    USER: "/url/user",
    ORG: "/url/org",
    GET: (id: string) => `/url/${id}`,
    UPDATE: (id: string) => `/url/${id}`,
    DELETE: (id: string) => `/url/${id}`,
    REDIRECT: (shortCode: string) => `/url/r/${shortCode}`,
  },

  USER_ACTIVITY: {
    LOGIN_ACTIVITY: "/users/login-activity",
  },

  SESSIONS: {
    LIST: "/sessions",
    UPDATE: (id: string) => `/sessions/${id}`,
    REVOKE: (id: string) => `/sessions/${id}/revoke`,
    LOGIN_ACTIVITY: "/sessions/login-activity",
  },

  HEALTH: {
    STATUS: "/health",
    READY: "/health/ready",
    FULL: "/health/full",
  },

  DASHBOARD: {
    SUMMARY: "/dashboard/summary",
    RECENT_URLS: "/dashboard/recent-urls",
    TOP_URLS: "/dashboard/top-urls",
  },
} as const;