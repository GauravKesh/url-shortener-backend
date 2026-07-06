// Safely parse the multiplier. Defaults to 1 (normal caching). 
// Set CACHE_TTL_MULTIPLIER=0 in your local .env to instantly disable all Redis caching.
const MULTIPLIER = process.env.CACHE_TTL_MULTIPLIER !== undefined 
  ? Number(process.env.CACHE_TTL_MULTIPLIER) 
  : 1;

export const CACHE_TTL = {
  // ==========================================
  // 1. ULTRA SHORT (15s - 60s) 
  // For highly dynamic data or aggressive security blocks
  // ==========================================
  RATE_LIMIT: 60 * MULTIPLIER,               // Sliding window rate limit counters
  NEGATIVE_SPAM_BLOCK: 60 * MULTIPLIER,      // Blocks invalid API keys/tokens/404s
  DASHBOARD_STATS: 60 * MULTIPLIER,          // Global metrics and charts
  DASHBOARD_RECENT: 30 * MULTIPLIER,         // Recent activity feeds
  DASHBOARD_TOP: 60 * MULTIPLIER,            // Top performing links
  API_KEY_LIST: 30 * MULTIPLIER,             // Org API key lists 

  // ==========================================
  // 2. SHORT (5 mins)
  // For high-traffic reads where a few minutes of staleness is perfectly fine
  // ==========================================
  REDIRECTS: 60 * 5 * MULTIPLIER,            // URL resolution (short-code to original)
  URL_DETAILS: 60 * 5 * MULTIPLIER,          // Single URL metadata lookup
  ACTIVE_SUBSCRIPTION: 60 * 5 * MULTIPLIER,  // Billing limits enforcement
  API_KEY_VALIDATION: 60 * 5 * MULTIPLIER,   // API auth middleware validation
  USAGE_LIMITS: 60 * 5 * MULTIPLIER,         // API calls / link creation quotas
  CUSTOM_DOMAIN: 60 * 5 * MULTIPLIER,        // Custom domain DNS validation state
  ANALYTICS_ROLLUP: 60 * 5 * MULTIPLIER,     // Click/Geo/Device aggregated stats

  // ==========================================
  // 3. MEDIUM (15 mins - 1 hour)
  // For standard relational data that rarely changes but is queried often
  // ==========================================
  USER_PROFILE: 60 * 15 * MULTIPLIER,        // Basic user data
  ORG_DETAILS: 60 * 60 * MULTIPLIER,         // Organization name, owner, settings
  ORG_MEMBERS: 60 * 15 * MULTIPLIER,         // List of users in an organization
  URL_LIST: 60 * 15 * MULTIPLIER,            // Paginated list of URLs for the UI
  DOMAIN_LIST: 60 * 30 * MULTIPLIER,         // List of custom domains for an org

  // ==========================================
  // 4. LONG (12 - 24 hours)
  // For static configurations, catalogs, and system-wide settings
  // ==========================================
  STATIC_PLANS: 60 * 60 * 24 * MULTIPLIER,   // Stripe/Pricing plan catalog
  PLAN_TAGS: 60 * 60 * 24 * MULTIPLIER,      // Org's string tag (e.g., "PRO", "ENTERPRISE")
  FEATURE_FLAGS: 60 * 60 * 12 * MULTIPLIER,  // Global toggle states for UI features

  // ==========================================
  // 5. EXTRA LONG (Days to Weeks)
  // For persisted state that relies on manual invalidation or token expiration
  // ==========================================
  SESSION: 60 * 60 * 24 * 7 * MULTIPLIER,    // JWT Refresh Token session (7 days)
  VERIFICATION_TOKEN: 60 * 60 * 24 * MULTIPLIER, // Email verification token (24 hours)
  PASSWORD_RESET: 60 * 15 * MULTIPLIER,      // Password reset token (15 mins)
} as const;