# 🚀 URL Shortener Backend

A **production-grade URL Shortener Backend** built with modern backend architecture, supporting authentication, API keys, analytics, and scalable infrastructure.

---

## 🧠 Overview

This project is designed as a **scalable backend system** for shortening URLs with:

* 🔐 Secure authentication (JWT + Refresh Tokens)
* 🏢 Organization & subscription-based plans
* 🔑 API key support for external integrations
* ⚡ Redis caching for performance
* 📊 MongoDB-based analytics
* 🧾 PostgreSQL for core relational data
* 📡 Kafka-ready event-driven architecture (future-ready)
* 🧩 Clean MVC + Repository architecture

---

## 🏗️ Tech Stack

* **Backend:** Node.js, TypeScript, Express.js
* **Database:**

  * PostgreSQL → users, URLs, subscriptions
  * MongoDB → analytics (clicks, events)
* **Caching:** Redis
* **Auth:** JWT + Refresh Tokens + Sessions
* **Logging:** Structured logging with request tracing
* **Dev Tools:** Nodemon, TSX

---

## ⚙️ Features

### 🔐 Authentication

* Signup/Login with JWT
* Refresh token rotation
* Multi-device session handling
* Secure cookies

### 🏢 Organizations & Plans

* Users can upgrade to organizations
* Subscription plans (FREE, PRO, ENTERPRISE)
* Plan-based limits:

  * URL creation
  * API usage
  * Expiry duration

### 🔗 URL Shortening

* Custom short codes
* Custom domain support
* Expiry handling
* Active / Inactive URLs

### 🔑 API Keys

* Generate API keys per organization
* Per-key rate limits (override plan)
* Revoke & manage keys

### 📊 Analytics

* Click tracking (MongoDB)
* IP, device, user-agent logging
* Scalable event storage

### ⚡ Performance

* Redis caching (planned)
* Efficient DB queries
* Indexed schema design

---

## 🔄 Request Lifecycle

```bash
Client → Middleware → Controller → Service → Repository → DB
                                   ↓
                                Response
```

---

## 🧾 API Response Format

```json
{
  "success": true,
  "requestId": "req_123abc",
  "message": "Operation successful",
  "data": {}
}
```

## 🧩 Frontend API Contract

This backend is mounted at `/api/v1`. The interactive docs are available at `/api/docs`, and the machine-readable spec is available at `/api/docs.json`.

### Auth And Session Rules

- `POST /auth/signup` and `POST /auth/login` return an `accessToken` in the JSON body and also set cookies.
- `refreshToken` is stored in an `HttpOnly` cookie and is rotated on refresh.
- `accessToken` is accepted either from the `Authorization: Bearer <token>` header or from the `accessToken` cookie.
- Most protected routes require auth through either bearer token or cookies.
- For profile data, prefer `GET /user/me`. The current `GET /auth/me` handler returns only the session context shape, not the full user profile.

### Standard Response Shapes

Successful responses use the shared envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "requestId": "req_123abc",
  "data": {}
}
```

Error responses usually look like this:

```json
{
  "success": false,
  "requestId": "req_123abc",
  "code": "AUTH_004",
  "message": "Unauthorized"
}
```

The plain 404 handler is simpler and may omit `code`.

### Core Data Objects

These are the main objects the frontend will receive.

- User profile: `id`, `public_id`, `email`, `name`, `avatar_url`, `is_active`, `is_verified`, `last_login_at`, `password_changed_at`, `max_sessions`, `created_at`, `updated_at`, `deleted_at`
- Organization: `id`, `public_id`, `name`, `owner_id`, `created_at`, `updated_at`
- URL row: `id`, `public_id`, `short_code`, `original_url`, `user_id`, `organization_id`, `domain_id`, `status`, `disabled_reason`, `expires_at`, `clicks`, `created_at`, `updated_at`, `deleted_at`
- API key row after sanitizing: `id`, `organization_id`, `name`, `revoked`, `rate_limit_per_min`, `max_links`, `max_expiry_days`, `last_used_at`, `created_at`
- Subscription: `id`, `organization_id`, `plan_id`, `start_date`, `end_date`, `status`, `created_at`
- Subscription plan: `id`, `name`, `max_links`, `max_api_keys`, `rate_limit_per_min`, `max_expiry_days`, `max_sessions`, `custom_domain_allowed`, `cycle_type`, `created_at`, `updated_at`
- Usage record: `id`, `organization_id`, `links_created`, `api_calls`, `period_start`, `period_end`, `created_at`

### Auth APIs

| Method | Path | Auth | Request body | Data returned |
| --- | --- | --- | --- | --- |
| POST | `/auth/signup` | Public | `email`, `password`, `organization_name?` | `user`, `organization`, `accessToken` |
| POST | `/auth/login` | Public | `email`, `password` | `user`, `organization` |
| POST | `/auth/logout` | Public | None | None |
| POST | `/auth/refresh` | Refresh cookie required | None | `accessToken` |
| GET | `/auth/me` | Bearer or cookie | None | `user` (session context only) |

Signup and login also set the `refreshToken` cookie. Login also sets the `accessToken` cookie.

### User APIs

| Method | Path | Auth | Request body | Data returned |
| --- | --- | --- | --- | --- |
| GET | `/user/me` | Required | None | `user` |
| PATCH | `/user/me` | Required | `name?`, `avatar_url?` | `user` |
| POST | `/user/change-password` | Required | `oldPassword`, `newPassword` | None |
| DELETE | `/user/me` | Required | None | None |

### Organization APIs

| Method | Path | Auth | Request body | Data returned |
| --- | --- | --- | --- | --- |
| POST | `/org` | Required | `name` | `organization` |
| GET | `/org/me` | Required | None | `organization` |
| GET | `/org/:id` | Required | None | `organization` |
| PATCH | `/org/:id` | Required | Partial org fields, currently `name` is used | `organization` |
| DELETE | `/org/:id` | Required | None | None |

### Subscription And Usage APIs

| Method | Path | Auth | Request body | Data returned |
| --- | --- | --- | --- | --- |
| POST | `/subscription/purchase` | Required | `planId` | `organization`, `subscription`, `plan` |
| GET | `/subscription/current` | Required | None | `subscription` |
| GET | `/usage/current` | Required | None | `usage` |

`GET /subscription/current` returns the active subscription row joined with the plan row, so the object includes both subscription fields and plan fields.

### API Key APIs

| Method | Path | Auth | Request body | Data returned |
| --- | --- | --- | --- | --- |
| POST | `/apikey` | Required | `name?`, `rateLimitPerMin?`, `maxLinks?`, `maxExpiryDays?` | `apiKey`, `data` |
| GET | `/apikey` | Required | Query params: `limit?`, `offset?` | `items`, `pagination` |
| PATCH | `/apikey/:id` | Required | `name?`, `rate_limit_per_min?`, `max_links?`, `max_expiry_days?` | Sanitized API key row |
| POST | `/apikey/:id/revoke` | Required | None | None |
| DELETE | `/apikey/:id` | Required | None | None |

Important behavior for API keys:

- The raw API key is returned only once, on create.
- Listed or updated keys are sanitized and never include `key_hash`.
- `GET /apikey` currently returns `pagination.limit` and `pagination.offset`, but does not include a `total` value.

### URL APIs

| Method | Path | Auth | Request body | Data returned |
| --- | --- | --- | --- | --- |
| GET | `/url/r/:shortCode` | Public | None | 302 redirect to the original URL |
| POST | `/url/create` | Required | `originalUrl`, `shortCode?`, `domainId?`, `expiresAt?` | Short code string |
| GET | `/url/user` | Required | Query params: `limit?`, `offset?` | `items`, `pagination` |
| GET | `/url/org` | Required | Query params: `limit?`, `offset?` | `items`, `pagination` |
| GET | `/url/:id` | Required | None | URL row |
| PUT | `/url/:id` | Required | `original_url?`, `short_code?`, `domain_id?`, `expires_at?` | Updated URL row |
| DELETE | `/url/:id` | Required | None | None |

Important behavior for URLs:

- Create uses camelCase body fields (`originalUrl`, `shortCode`, `domainId`, `expiresAt`).
- Update uses snake_case fields (`original_url`, `short_code`, `domain_id`, `expires_at`) because the service forwards the body to the SQL whitelist.
- `POST /url/create` returns only the generated short code string in `data`, not the full row.
- `GET /url/user` and `GET /url/org` return `data.items` plus `data.pagination`.
- `GET /url/r/:shortCode` performs a real redirect and does not return JSON on success.

### Health APIs

| Method | Path | Auth | Data returned |
| --- | --- | --- | --- |
| GET | `/health` | Public | `status`, `uptime`, `timestamp` |
| GET | `/health/ready` | Public | `status`, `services`, `timestamp` |
| GET | `/health/full` | Public | `status`, `services`, `uptime`, `timestamp` |

### Request Payload Cheat Sheet

Use these shapes when building the frontend forms or AI-generated UI:

```json
{
  "signup": {
    "email": "user@example.com",
    "password": "Secret123!",
    "organization_name": "Acme"
  },
  "login": {
    "email": "user@example.com",
    "password": "Secret123!"
  },
  "createUrl": {
    "originalUrl": "https://example.com/long-url",
    "shortCode": "summer-sale",
    "domainId": 1,
    "expiresAt": "2026-12-31T23:59:59.000Z"
  },
  "updateUrl": {
    "original_url": "https://example.com/updated",
    "short_code": "summer-sale-v2",
    "domain_id": 1,
    "expires_at": "2026-12-31T23:59:59.000Z"
  },
  "createApiKey": {
    "name": "Frontend integration key",
    "rateLimitPerMin": 120,
    "maxLinks": 500,
    "maxExpiryDays": 30
  },
  "purchaseSubscription": {
    "planId": 2
  },
  "updateProfile": {
    "name": "Gaurav",
    "avatar_url": "https://cdn.example.com/avatar.png"
  }
}
```

### Frontend Integration Notes

- All protected requests should send cookies with `credentials: "include"` if you are using browser cookie auth.
- Read `requestId` from every response and carry it into frontend error logs or support tooling.
- Prefer `/user/me`, `/org/me`, `/usage/current`, and `/subscription/current` for dashboard bootstrap data.
- Use `/url/user` for the personal dashboard and `/url/org` for organization-wide URL management.
- Use `/api/docs` while developing the frontend to inspect the live contract and response examples.

---

## 🛠️ Setup & Installation

### Clone repo

```bash
git clone https://github.com/gauravkesh/url-shortener-backend.git
cd url-shortener-backend
```

---

### Install dependencies

```bash
npm install
```

---

### Run development server

```bash
npm run dev
```

---

### Build for production

```bash
npm run build
npm start
```

---

## 🧱 Database Schema

* Users
* Organizations
* Subscription Plans
* Subscriptions
* URLs
* Domains
* API Keys
* User Sessions

---

## 🔐 Security

* JWT authentication
* Refresh token rotation
* API key hashing
* CSRF protection (planned)
* Rate limiting (planned)

---

## 📈 Scalability Design

* Horizontal scaling ready
* Event-driven architecture (Kafka-ready)
* Separation of concerns (DB + cache + analytics)
* Request tracing with requestId

---

## 🧪 Future Improvements

* Kafka integration for analytics pipeline
* Distributed rate limiting
* Admin dashboard
* Webhooks support
* Advanced analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or PRs.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Gaurav Kesh Roushan**\
Backend Developer | Open Source Contributor

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
