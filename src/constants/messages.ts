export const MESSAGES = {
  SUCCESS: "Operation successful",

  // General
  FAILED: "Operation failed",
  INVALID_REQUEST: "Invalid request",
  ROUTE_NOT_FOUND: "Route not found",
  RESOURCE_NOT_FOUND: "Resource not found",
  ALREADY_EXISTS: "Resource already exists",
  SERVER_ERROR: "Internal server error",

  // Informational (1xx)
  CONTINUE: "Continue with request",
  SWITCHING_PROTOCOLS: "Switching protocols",
  PROCESSING: "Request is being processed",
  EARLY_HINTS: "Early hints available",

  // Success (2xx)
  OK: "Request completed successfully",
  CREATED: "Resource created successfully",
  ACCEPTED: "Request accepted for processing",
  NON_AUTHORITATIVE_INFORMATION: "Returning non-authoritative information",
  NO_CONTENT: "Request completed with no content",
  RESET_CONTENT: "Reset the document view",
  PARTIAL_CONTENT: "Returning partial content",
  MULTI_STATUS: "Multiple status responses returned",
  ALREADY_REPORTED: "Resource already reported",
  IM_USED: "Instance manipulation used",

  // Redirection (3xx)
  MULTIPLE_CHOICES: "Multiple choices available",
  MOVED_PERMANENTLY: "Resource moved permanently",
  FOUND: "Resource temporarily available at another location",
  SEE_OTHER: "See other resource",
  NOT_MODIFIED: "Resource has not been modified",
  TEMPORARY_REDIRECT: "Temporary redirect",
  PERMANENT_REDIRECT: "Permanent redirect",

  // Client errors (4xx)
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized access",
  PAYMENT_REQUIRED: "Payment required",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  METHOD_NOT_ALLOWED: "HTTP method not allowed",
  NOT_ACCEPTABLE: "Requested format is not acceptable",
  PROXY_AUTHENTICATION_REQUIRED: "Proxy authentication required",
  REQUEST_TIMEOUT: "Request timed out",
  CONFLICT: "Request conflicts with current state",
  GONE: "Resource is no longer available",
  LENGTH_REQUIRED: "Content-Length header is required",
  PRECONDITION_FAILED: "Precondition failed",
  PAYLOAD_TOO_LARGE: "Request payload is too large",
  URI_TOO_LONG: "Request URI is too long",
  UNSUPPORTED_MEDIA_TYPE: "Unsupported media type",
  RANGE_NOT_SATISFIABLE: "Requested range not satisfiable",
  EXPECTATION_FAILED: "Expectation failed",
  MISDIRECTED_REQUEST: "Misdirected request",
  UNPROCESSABLE_ENTITY: "Validation failed",
  LOCKED: "Resource is locked",
  FAILED_DEPENDENCY: "Failed dependency",
  TOO_EARLY: "Request is too early",
  UPGRADE_REQUIRED: "Protocol upgrade required",
  PRECONDITION_REQUIRED: "Precondition required",
  TOO_MANY_REQUESTS: "Too many requests",
  REQUEST_HEADER_FIELDS_TOO_LARGE: "Request header fields are too large",
  UNAVAILABLE_FOR_LEGAL_REASONS: "Unavailable for legal reasons",

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: "Internal server error",
  NOT_IMPLEMENTED: "Feature not implemented",
  BAD_GATEWAY: "Bad gateway",
  SERVICE_UNAVAILABLE: "Service unavailable",
  GATEWAY_TIMEOUT: "Gateway timeout",
  HTTP_VERSION_NOT_SUPPORTED: "HTTP version not supported",
  VARIANT_ALSO_NEGOTIATES: "Variant also negotiates",
  INSUFFICIENT_STORAGE: "Insufficient storage",
  LOOP_DETECTED: "Loop detected",
  NOT_EXTENDED: "Further extensions to the request are required",
  NETWORK_AUTHENTICATION_REQUIRED: "Network authentication required",

  // Health & operations
  HEALTH_OK: "Service is healthy",
  HEALTH_DEGRADED: "Service is degraded",
  HEALTH_UNHEALTHY: "Service is unhealthy",
  READINESS_OK: "Service is ready",
  READINESS_NOT_READY: "Service is not ready",
  LIVENESS_OK: "Service is alive",
  DEPENDENCY_UNAVAILABLE: "One or more dependencies are unavailable",
  MAINTENANCE_MODE: "Service is under maintenance",

  // Auth
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTER_SUCCESS: "User registered successfully",
  PASSWORD_RESET_SENT: "Password reset link sent",
  PASSWORD_RESET_SUCCESS: "Password reset successful",
  EMAIL_VERIFICATION_SENT: "Email verification sent",
  EMAIL_VERIFIED: "Email verified successfully",
  MFA_REQUIRED: "Multi-factor authentication required",
  MFA_VERIFIED: "Multi-factor authentication verified",
  SESSION_EXPIRED: "Session expired",
  TOKEN_REFRESHED: "Token refreshed successfully",

  // User
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_FETCHED: "User fetched successfully",

  // Organization
  ORGANIZATION_CREATED: "Organization created successfully",
  ORGANIZATION_UPDATED: "Organization updated successfully",
  ORGANIZATION_DELETED: "Organization deleted successfully",
  ORGANIZATION_FETCHED: "Organization fetched successfully",
  MEMBER_INVITED: "Organization member invited successfully",
  MEMBER_REMOVED: "Organization member removed successfully",

  // Subscription & billing
  SUBSCRIPTION_CREATED: "Subscription created successfully",
  SUBSCRIPTION_UPDATED: "Subscription updated successfully",
  SUBSCRIPTION_CANCELLED: "Subscription cancelled successfully",
  SUBSCRIPTION_RENEWED: "Subscription renewed successfully",
  SUBSCRIPTION_FETCHED: "Subscription fetched successfully",
  PLAN_UPGRADED: "Subscription plan upgraded successfully",
  PLAN_DOWNGRADED: "Subscription plan downgraded successfully",
  BILLING_UPDATED: "Billing details updated successfully",
  PAYMENT_PROCESSED: "Payment processed successfully",
  PAYMENT_FAILED: "Payment failed",
  INVOICE_GENERATED: "Invoice generated successfully",

  // Usage & limits
  USAGE_FETCHED: "Usage fetched successfully",
  LIMIT_REACHED: "Usage limit reached",
  QUOTA_EXCEEDED: "Quota exceeded",
  RATE_LIMITED: "Rate limit exceeded",

  // URL
  URL_CREATED: "Short URL created successfully",
  URL_FETCHED: "URL fetched successfully",
  URL_UPDATED: "URL updated successfully",
  URL_DELETED: "URL deleted successfully",
  URL_EXPIRED: "Short URL has expired",
  URL_DISABLED: "Short URL is disabled",

  // API Key
  API_KEY_CREATED: "API key generated successfully",
  API_KEY_DELETED: "API key deleted successfully",
  API_KEY_REVOKED: "API key revoked successfully",
  API_KEY_ROTATED: "API key rotated successfully",
  API_KEY_UPDATED:"API key updated successfully",
  API_KEYS_FETCHED:"API key fetched successfully",
  API_KEY_INVALID: "Invalid API key",


  // Notifications & webhook
  NOTIFICATION_SENT: "Notification sent successfully",
  NOTIFICATION_QUEUED: "Notification queued successfully",
  WEBHOOK_DELIVERED: "Webhook delivered successfully",
  WEBHOOK_RETRY_SCHEDULED: "Webhook retry scheduled",

  // Data & integration
  DATABASE_CONNECTED: "Database connection established",
  DATABASE_UNAVAILABLE: "Database is unavailable",
  CACHE_CONNECTED: "Cache connection established",
  CACHE_UNAVAILABLE: "Cache is unavailable",
  QUEUE_UNAVAILABLE: "Message queue is unavailable",
  EXTERNAL_SERVICE_UNAVAILABLE: "External service is unavailable",
};