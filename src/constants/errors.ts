export const ERRORS = {
    // Generic
    INTERNAL: { code: "GEN_500", message: "Something went wrong", status: 500 },
    BAD_REQUEST: { code: "GEN_400", message: "Bad request", status: 400 },
    NOT_FOUND: { code: "GEN_404", message: "Resource not found", status: 404 },
    CONFLICT: { code: "GEN_409", message: "Resource conflict", status: 409 },
    VALIDATION_ERROR: {
        code: "GEN_422",
        message: "Validation failed",
        status: 422,
    },
    METHOD_NOT_ALLOWED: {
        code: "GEN_405",
        message: "Method not allowed",
        status: 405,
    },
    UNSUPPORTED_MEDIA_TYPE: {
        code: "GEN_415",
        message: "Unsupported media type",
        status: 415,
    },
    PAYLOAD_TOO_LARGE: {
        code: "GEN_413",
        message: "Payload too large",
        status: 413,
    },
    SERVICE_UNAVAILABLE: {
        code: "GEN_503",
        message: "Service unavailable",
        status: 503,
    },
    GATEWAY_TIMEOUT: {
        code: "GEN_504",
        message: "Gateway timeout",
        status: 504,
    },

    // Auth & session
    INVALID_CREDENTIALS: {
        code: "AUTH_001",
        message: "Invalid credentials",
        status: 401,
    },
    INVALID_TOKEN: {
        code: "AUTH_002",
        message: "Invalid token",
        status: 401,
    },
    INVALID_SESSION: {
        code: "AUTH_003",
        message: "Invalid or expired session",
        status: 401,
    },
    TOKEN_EXPIRED: {
        code: "AUTH_003",
        message: "Token expired",
        status: 401,
    },
    UNAUTHORIZED: {
        code: "AUTH_004",
        message: "Unauthorized",
        status: 401,
    },
    FORBIDDEN: {
        code: "AUTH_005",
        message: "Forbidden",
        status: 403,
    },
    TOKEN_REVOKED: {
        code: "AUTH_006",
        message: "Token revoked",
        status: 401,
    },
    MFA_REQUIRED: {
        code: "AUTH_007",
        message: "Multi-factor authentication required",
        status: 401,
    },
    ACCOUNT_LOCKED: {
        code: "AUTH_008",
        message: "Account locked",
        status: 423,
    },
    ACCOUNT_DISABLED: {
        code: "AUTH_009",
        message: "Account disabled",
        status: 403,
    },
    EMAIL_NOT_VERIFIED: {
        code: "AUTH_010",
        message: "Email not verified",
        status: 403,
    },

    // User
    USER_NOT_FOUND: {
        code: "USER_404",
        message: "User not found",
        status: 404,
    },
    USER_ALREADY_EXISTS: {
        code: "USER_409",
        message: "User already exists",
        status: 409,
    },
    USER_INACTIVE: {
        code: "USER_403",
        message: "User is inactive",
        status: 403,
    },
    USER_LIMIT_REACHED: {
        code: "USER_429",
        message: "User limit reached",
        status: 429,
    },

    // Organization
    ORGANIZATION_NOT_FOUND: {
        code: "ORG_404",
        message: "Organization not found",
        status: 404,
    },
    ORGANIZATION_ALREADY_EXISTS: {
        code: "ORG_409",
        message: "Organization already exists",
        status: 409,
    },
    ORGANIZATION_ACCESS_DENIED: {
        code: "ORG_403",
        message: "Organization access denied",
        status: 403,
    },
    MEMBER_NOT_FOUND: {
        code: "ORG_404_MEMBER",
        message: "Organization member not found",
        status: 404,
    },
    MEMBER_ALREADY_EXISTS: {
        code: "ORG_409_MEMBER",
        message: "Member already exists in organization",
        status: 409,
    },

    // URL
    URL_NOT_FOUND: {
        code: "URL_404",
        message: "Short URL not found",
        status: 404,
    },
    URL_EXPIRED: {
        code: "URL_410",
        message: "Short URL expired",
        status: 410,
    },
    INVALID_URL: {
        code: "URL_400",
        message: "Invalid URL",
        status: 400,
    },
    ALIAS_TAKEN: {
        code: "URL_409",
        message: "Alias already taken",
        status: 409,
    },
    URL_DISABLED: {
        code: "URL_423",
        message: "Short URL is disabled",
        status: 423,
    },
    URL_LIMIT_REACHED: {
        code: "URL_429",
        message: "URL creation limit reached",
        status: 429,
    },

    // API key
    API_KEY_INVALID: {
        code: "API_401",
        message: "Invalid API key",
        status: 401,
    },
    API_KEY_EXPIRED: {
        code: "API_402",
        message: "API key expired",
        status: 401,
    },
    API_KEY_REVOKED: {
        code: "API_403",
        message: "API key revoked",
        status: 401,
    },
    API_KEY_SCOPES_INSUFFICIENT: {
        code: "API_403_SCOPE",
        message: "API key does not have required scope",
        status: 403,
    },

    // Subscription & billing
    SUBSCRIPTION_NOT_FOUND: {
        code: "SUB_404",
        message: "Subscription not found",
        status: 404,
    },
    SUBSCRIPTION_INACTIVE: {
        code: "SUB_403",
        message: "Subscription is inactive",
        status: 403,
    },
    SUBSCRIPTION_EXPIRED: {
        code: "SUB_402",
        message: "Subscription has expired",
        status: 402,
    },
    PLAN_NOT_FOUND: {
        code: "SUB_404_PLAN",
        message: "Subscription plan not found",
        status: 404,
    },
    PLAN_LIMIT_REACHED: {
        code: "SUB_429",
        message: "Plan limit reached",
        status: 429,
    },
    FEATURE_NOT_AVAILABLE: {
        code: "SUB_403_FEATURE",
        message: "Feature not available in current plan",
        status: 403,
    },
    PAYMENT_REQUIRED: {
        code: "BILL_402",
        message: "Payment required",
        status: 402,
    },
    PAYMENT_FAILED: {
        code: "BILL_402_FAIL",
        message: "Payment failed",
        status: 402,
    },
    INVOICE_NOT_FOUND: {
        code: "BILL_404_INVOICE",
        message: "Invoice not found",
        status: 404,
    },

    // Rate limit & quota
    TOO_MANY_REQUESTS: {
        code: "RATE_429",
        message: "Too many requests",
        status: 429,
    },
    QUOTA_EXCEEDED: {
        code: "RATE_429_QUOTA",
        message: "Quota exceeded",
        status: 429,
    },
    BURST_LIMIT_EXCEEDED: {
        code: "RATE_429_BURST",
        message: "Burst rate limit exceeded",
        status: 429,
    },

    // Notifications & webhook
    NOTIFICATION_DELIVERY_FAILED: {
        code: "NOTIFY_502",
        message: "Notification delivery failed",
        status: 502,
    },
    WEBHOOK_SIGNATURE_INVALID: {
        code: "WH_401_SIGN",
        message: "Invalid webhook signature",
        status: 401,
    },
    WEBHOOK_ENDPOINT_UNREACHABLE: {
        code: "WH_503_ENDPOINT",
        message: "Webhook endpoint unreachable",
        status: 503,
    },

    // Infrastructure
    DATABASE_ERROR: {
        code: "DB_500",
        message: "Database error",
        status: 500,
    },
    DATABASE_UNAVAILABLE: {
        code: "DB_503",
        message: "Database unavailable",
        status: 503,
    },
    CACHE_ERROR: {
        code: "CACHE_500",
        message: "Cache error",
        status: 500,
    },
    CACHE_UNAVAILABLE: {
        code: "CACHE_503",
        message: "Cache unavailable",
        status: 503,
    },
    QUEUE_UNAVAILABLE: {
        code: "QUEUE_503",
        message: "Message queue unavailable",
        status: 503,
    },
    EXTERNAL_SERVICE_ERROR: {
        code: "EXT_502",
        message: "External service error",
        status: 502,
    },
    EXTERNAL_SERVICE_TIMEOUT: {
        code: "EXT_504",
        message: "External service timeout",
        status: 504,
    },

    // Compliance & legal
    DATA_RETENTION_RESTRICTED: {
        code: "LEGAL_451_RETENTION",
        message: "Data access restricted by retention policy",
        status: 451,
    },
    UNAVAILABLE_FOR_LEGAL_REASONS: {
        code: "LEGAL_451",
        message: "Unavailable for legal reasons",
        status: 451,
    },
} as const;