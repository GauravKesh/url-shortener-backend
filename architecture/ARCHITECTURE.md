┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ id (PK)             │
│ user_id (UUID)      │
│ email               │
│ password_hash       │
│ role                │
│ is_active           │
│ is_verified         │
└─────────┬───────────┘
          │
          │ owns
          ▼
┌─────────────────────┐
│   ORGANIZATIONS     │
├─────────────────────┤
│ id (PK)             │
│ organization_id     │
│ name                │
│ owner_id (FK)       │
└──────┬──────┬───────┘
       │      │
       │      │
       │      ├─────────────────────────────┐
       │                                    │
       ▼                                    ▼
┌─────────────────┐             ┌─────────────────────┐
│   DOMAINS       │             │   SUBSCRIPTIONS     │
├─────────────────┤             ├─────────────────────┤
│ id (PK)         │             │ id (PK)             │
│ domain_name     │             │ organization_id FK  │
│ organization_id │             │ plan_id FK          │
│ verified        │             │ start_date          │
└───────┬─────────┘             │ end_date            │
        │                       │ status              │
        │                       └─────────┬───────────┘
        │                                 │
        │                                 │
        │                                 ▼
        │                    ┌─────────────────────┐
        │                    │ SUBSCRIPTION_PLANS  │
        │                    ├─────────────────────┤
        │                    │ id (PK)             │
        │                    │ name                │
        │                    │ max_links           │
        │                    │ max_api_keys        │
        │                    │ rate_limit_per_min │
        │                    │ custom_domain       │
        │                    └─────────────────────┘
        │
        │
        ▼
┌─────────────────────┐
│       URLS          │
├─────────────────────┤
│ id (PK)             │
│ url_id              │
│ short_code          │
│ original_url        │
│ user_id FK          │
│ organization_id FK  │
│ domain_id FK        │
│ clicks              │
│ expires_at          │
└───────┬─────────────┘
        │
        │ created by
        │
        ▼
┌─────────────────────┐
│       USERS         │
└─────────────────────┘


┌─────────────────────┐
│      API_KEYS       │
├─────────────────────┤
│ id (PK)             │
│ organization_id FK  │
│ key_hash            │
│ rate_limit_override │
│ max_links_override  │
└─────────▲───────────┘
          │
          │ belongs to
          │
┌─────────┴───────────┐
│   ORGANIZATIONS     │
└─────────────────────┘


┌─────────────────────┐
│   USER_SESSIONS     │
├─────────────────────┤
│ id (PK)             │
│ user_id FK          │
│ refresh_token_hash  │
│ device              │
│ expires_at          │
└─────────▲───────────┘
          │
          │
          │
┌─────────┴───────────┐
│       USERS         │
└─────────────────────┘


┌─────────────────────┐
│  USAGE_TRACKING     │
├─────────────────────┤
│ id (PK)             │
│ organization_id FK  │
│ links_created       │
│ api_calls           │
│ period_start        │
│ period_end          │
└─────────▲───────────┘
          │
          │
          │
┌─────────┴───────────┐
│   ORGANIZATIONS     │
└─────────────────────┘