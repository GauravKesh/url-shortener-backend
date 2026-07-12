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

  // Advanced Auth & Token Links
  PASSWORD_TOKEN_EXPIRED: "The password reset link has expired",
  PASSWORD_TOKEN_INVALID: "The password reset link is invalid or has already been used",
  PASSWORD_TOKEN_GENERATED: "Password reset token generated.",
  EMAIL_VERIFICATION_EXPIRED: "The email verification link has expired",
  EMAIL_ALREADY_VERIFIED: "This email address is already verified",
  ACCOUNT_LOCKED: "Account temporarily locked due to too many failed login attempts",


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
  API_KEY_UPDATED: "API key updated successfully",
  API_KEYS_FETCHED: "API key fetched successfully",
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

  // URL & Alias Specifics
  ALIAS_ALREADY_TAKEN: "This custom alias is already in use",
  ALIAS_RESERVED: "This alias is reserved and cannot be used",
  INVALID_ALIAS_FORMAT: "Alias contains invalid characters or exceeds length limits",
  DESTINATION_URL_INVALID: "The provided destination URL is malformed or invalid",
  URL_PASSWORD_REQUIRED: "This short link is password-protected",
  URL_PASSWORD_INVALID: "Incorrect password for this short link",
  BULK_URL_CREATION_SUCCESS: "Bulk URLs processed successfully",
  BULK_URL_CREATION_FAILED: "Failed to process bulk URL request",

  // Custom Domains
  DOMAIN_ADDED: "Custom domain added successfully",
  DOMAIN_DELETED: "Custom domain removed successfully",
  DOMAIN_VERIFIED: "Domain ownership verified successfully",
  DOMAIN_VERIFICATION_FAILED: "Domain verification failed",
  DOMAIN_DNS_NOT_CONFIGURED: "DNS records are not properly configured yet",
  DOMAIN_ALREADY_EXISTS: "This domain is already registered by another account",
  SSL_CERTIFICATE_ISSUED: "SSL certificate generated successfully",
  SSL_CERTIFICATE_FAILED: "Failed to generate SSL certificate",

  // Analytics
  ANALYTICS_FETCHED: "Analytics data retrieved successfully",
  CLICK_TRACKED: "Link click registered successfully",
  EXPORT_STARTED: "Analytics export data is being generated",
  EXPORT_READY: "Analytics report is ready for download",

  // Link Safety & Security
  URL_SPAM_FLAGGED: "This URL has been flagged as potential spam or phishing",
  URL_MALICIOUS: "Destination URL contains known malware or security threats",
  DOMAIN_BLACKLISTED: "The target domain is on our blacklist",
  URL_UNDER_REVIEW: "This link is currently undergoing a safety review",

  // Advanced Features
  QR_CODE_GENERATED: "QR Code generated successfully",
  META_TAGS_UPDATED: "Link social media preview tags updated successfully",

  // Folders & Tags (Organization)
  FOLDER_CREATED: "Folder created successfully",
  FOLDER_UPDATED: "Folder renamed successfully",
  FOLDER_DELETED: "Folder deleted successfully",
  TAG_CREATED: "Tag created successfully",
  TAG_ATTACHED: "Tag added to link successfully",
  TAG_DETACHED: "Tag removed from link successfully",

  // Roles & Permissions (RBAC)
  INSUFFICIENT_PERMISSIONS: "You do not have permission to perform this action",
  ROLE_UPDATED: "User role updated successfully",
  CANNOT_REMOVE_OWNER: "Cannot remove the owner of the organization",
  OWNERSHIP_TRANSFERRED: "Organization ownership transferred successfully",

  // Advanced Link Routing (A/B Testing, Geo-targeting, Device-targeting)
  ROUTING_RULES_UPDATED: "Link routing rules updated successfully",
  FALLBACK_URL_REQUIRED: "A fallback URL is required for conditional routing",
  DEEP_LINK_CONFIGURED: "Mobile deep link configurations saved",

  // Media & File Uploads (For custom QR code logos or custom domain favicons)
  FILE_UPLOADED: "File uploaded successfully",
  FILE_SIZE_EXCEEDED: "Uploaded file exceeds the maximum allowed size",
  INVALID_FILE_TYPE: "Invalid file format. Only images are allowed",
  FILE_DELETED: "File removed successfully",

  // Rate Limiting & Abuse Prevention (Granular)
  IP_BANNED: "This IP address has been temporarily banned due to suspicious activity",
  CAPTCHA_REQUIRED: "Please complete the CAPTCHA to continue",
  CAPTCHA_FAILED: "CAPTCHA verification failed",
  TOO_MANY_LOGIN_ATTEMPTS: "Too many login attempts. Try again later",

  // Import / Export (Bulk operations)
  IMPORT_STARTED: "Link import process has started in the background",
  IMPORT_COMPLETED: "Links imported successfully",
  IMPORT_FAILED: "Errors occurred during link import",
  EXPORT_REQUESTED: "Export requested. You will receive an email when it is ready",

  // --- Image & Media Uploads ---
  IMAGE_UPLOAD_SUCCESS: "Image uploaded successfully",
  IMAGE_UPLOAD_FAILED: "Failed to upload image",
  IMAGE_TOO_LARGE: "Image file size exceeds the allowed limit (e.g., 5MB max)",
  UNSUPPORTED_IMAGE_FORMAT: "Unsupported image format. Please use JPG, PNG, WebP, or SVG",
  IMAGE_DELETED: "Image deleted successfully",
  IMAGE_PROCESSING_FAILED: "Failed to process or compress the uploaded image",

  // Specific Image Contexts
  AVATAR_UPDATED: "Profile avatar updated successfully",
  AVATAR_REMOVED: "Profile avatar removed",
  OG_IMAGE_UPDATED: "Social preview (OpenGraph) image updated successfully",
  OG_IMAGE_REMOVED: "Social preview image removed",
  QR_LOGO_UPDATED: "QR code center logo uploaded successfully",
  QR_LOGO_REMOVED: "QR code center logo removed",

  // --- Advanced Analytics & Reporting ---
  // General Stats
  STATS_FETCHED: "Statistics retrieved successfully",
  ANALYTICS_NO_DATA: "No analytics data available for the selected date range",
  INVALID_DATE_RANGE: "The provided date range is invalid",

  // Granular Metrics
  GEO_STATS_FETCHED: "Geographic analytics (countries/cities) retrieved successfully",
  DEVICE_STATS_FETCHED: "Device analytics (OS/browser/device type) retrieved successfully",
  REFERRER_STATS_FETCHED: "Referrer analytics (social media/websites) retrieved successfully",
  TIME_SERIES_FETCHED: "Time-series click data retrieved successfully",

  // Reports & Exports
  REPORT_GENERATION_STARTED: "Report generation started. This may take a few moments",
  REPORT_READY_FOR_DOWNLOAD: "Your analytics report is ready for download",
  REPORT_FAILED: "Failed to generate the analytics report",
  UNSUPPORTED_EXPORT_FORMAT: "Unsupported export format. Please request CSV or PDF",

  // --- Link QR Code Customization ---
  QR_DESIGN_SAVED: "QR code design preferences saved successfully",
  QR_TEMPLATE_CREATED: "QR code template created successfully",
  QR_TEMPLATE_DELETED: "QR code template deleted",

  // --- Agent Lifecycle & State ---
  AGENT_INITIALIZED: "AI Agent initialized successfully",
  AGENT_PAUSED: "Agent execution paused waiting for user input",
  AGENT_RESUMED: "Agent execution resumed",
  AGENT_TERMINATED: "Agent execution terminated",
  AGENT_ESCALATED: "Agent escalated task to human operator",
  MAX_STEPS_REACHED: "Agent execution stopped: Maximum reasoning steps reached",
  CONTEXT_WINDOW_EXCEEDED: "Input and history exceed the model's maximum context window",
  STATE_PERSISTENCE_FAILED: "Failed to save the agent's current state",

  // --- Tool & Function Calling ---
  TOOL_CALL_INITIATED: "Agent initiated a tool call",
  TOOL_EXECUTION_SUCCESS: "Tool executed successfully",
  TOOL_EXECUTION_FAILED: "Tool execution failed",
  TOOL_NOT_FOUND: "Agent attempted to call a tool that does not exist",
  TOOL_UNAUTHORIZED: "Agent is not authorized to use this tool",
  INVALID_TOOL_ARGUMENTS: "Agent provided invalid arguments for the tool schema",
  TOOL_TIMEOUT: "Tool execution timed out",

  // --- Human-in-the-Loop (HITL) & Approvals ---
  TOOL_APPROVAL_REQUIRED: "Tool execution requires human approval",
  TOOL_APPROVAL_GRANTED: "Tool execution approved by user",
  TOOL_APPROVAL_DENIED: "Tool execution denied by user",
  ACTION_NEEDS_CLARIFICATION: "Agent requires clarification to proceed",

  // --- Memory & Context Management (Short & Long-term) ---
  MEMORY_STORED: "Context successfully saved to agent memory",
  MEMORY_RETRIEVED: "Relevant memories retrieved successfully",
  MEMORY_PRUNED: "Old context pruned to fit memory constraints",
  VECTOR_DB_UNAVAILABLE: "Vector database connection failed",
  EMBEDDING_FAILED: "Failed to generate text embeddings for memory storage",
  KNOWLEDGE_BASE_SYNCED: "Knowledge base synchronized successfully",

  // --- Orchestration & Reasoning Loop ---
  PLANNING_STARTED: "Agent is generating an execution plan",
  PLAN_UPDATED: "Execution plan adapted based on new observations",
  SUBTASK_COMPLETED: "Agent completed a sub-task",
  REASONING_ERROR: "Agent encountered a logic error during reasoning",
  INVALID_JSON_RESPONSE: "Model returned malformed JSON that could not be parsed",
  RATE_LIMIT_LLM: "LLM Provider rate limit exceeded. Retrying...",
  PROVIDER_ERROR: "Upstream LLM provider encountered an error",

  // --- Guardrails, Security & Anti-Abuse ---
  GUARDRAIL_TRIGGERED: "Agent output blocked by safety guardrails",
  PROMPT_INJECTION_DETECTED: "Potential prompt injection or jailbreak detected",
  PII_REDACTED: "Sensitive Personally Identifiable Information (PII) redacted",
  CONFUSED_DEPUTY_PREVENTED: "Blocked unauthorized cross-tenant data access attempt",
  CONTENT_MODERATION_FLAGGED: "Input flagged by content moderation policies",

  // --- Workspaces & Sandboxes (e.g., Code Interpreters) ---
  WORKSPACE_PROVISIONED: "Isolated execution workspace created",
  WORKSPACE_DESTROYED: "Execution workspace cleaned up",
  SANDBOX_TIMEOUT: "Code execution exceeded allowed time limits",
  SANDBOX_CRASHED: "Isolated code execution environment crashed",
  FILE_GENERATED: "Agent generated a file successfully",
  UNAUTHORIZED_FILE_ACCESS: "Agent attempted to access restricted file paths",

  // Token Lifecycle & Validation
  TOKEN_VERIFIED: "Token verified successfully",
  TOKEN_EXPIRED: "This token has expired. Please request a new one",
  TOKEN_INVALID: "This token is invalid or malformed",
  TOKEN_ALREADY_USED: "This token has already been used",
  TOKEN_MISSING: "No token provided in the request",

  // Secure Auth Responses (Anti-Enumeration)
  PASSWORD_RESET_REQUESTED: "If an account with that email exists, a password reset link has been sent.",
  FORGOT_USERNAME_REQUESTED: "If that email is registered, we have sent your username to it.",
  VERIFICATION_RESENT: "If your account requires verification, a new link has been sent.",

};
