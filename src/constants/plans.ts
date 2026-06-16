export const SUBSCRIPTION_PLANS = {
  FREE: {
    max_links: 100,
    max_api_keys: 1,
    rate_limit_per_min: 60,
    max_expiry_days: 10,
    max_sessions: 2,
    custom_domain_allowed: false,
    cycle_type: "CALENDAR_MONTH",
  },

  PRO: {
    max_links: 1000,
    max_api_keys: 5,
    rate_limit_per_min: 300,
    max_expiry_days: 30,
    max_sessions: 5,
    custom_domain_allowed: true,
    cycle_type: "BILLING_CYCLE",
  },

  ENTERPRISE: {
    max_links: 10000,
    max_api_keys: 20,
    rate_limit_per_min: 1000,
    max_expiry_days: 365,
    max_sessions: 10,
    custom_domain_allowed: true,
    cycle_type: "BILLING_CYCLE",
  },
} as const;

export type PlanName = keyof typeof SUBSCRIPTION_PLANS;