# Frontend API Reference

This file lists backend API endpoints, HTTP methods, auth requirements, and the main request fields (query/body). Use these as the canonical reference when building frontend requests. Prepend your server base URL (e.g. `https://api.example.com`) when calling.

Mount points are taken from `src/apis/routes/index.ts` — paths below include those mounts (e.g. `/auth/signup`).

---

## /auth

- POST /auth/signup
  - Auth: no
  - Body (JSON): { email, password, organization_name? }
  - Response: sets `accessToken` and `refreshToken` cookies; returns created `user` and `organization`.

- POST /auth/login
  - Auth: no
  - Body (JSON): { email, password }
  - Response: sets `accessToken` and `refreshToken` cookies; returns `user` and `organization`.

- POST /auth/request-password-reset
  - Auth: no
  - Body (JSON): { email }
  - Response: message; (development mode returns `resetUrl` preview)

- POST /auth/reset-password
  - Auth: no
  - Body (JSON): { token, newPassword, logoutOtherSessions? }
  - Response: success message

- POST /auth/logout
  - Auth: no (clears cookies)
  - Body: none
  - Response: success message

- POST /auth/refresh
  - Auth: no (reads `refreshToken` cookie)
  - Body: none
  - Response: sets `accessToken` cookie and returns `accessToken` in body

- GET /auth/me
  - Auth: yes (requires valid access token cookie or header)
  - Query: none
  - Response: { user }

---

## /user

- GET /user/me
  - Auth: yes
  - Response: current user

- PATCH /user/me
  - Auth: yes
  - Body (JSON): partial user fields (e.g. `name`, `avatar`, `bio` depending on implementation)
  - Response: updated user

- POST /user/change-password
  - Auth: yes
  - Body (JSON): { currentPassword, newPassword, logoutOtherSessions? }
  - Response: success message

- DELETE /user/me
  - Auth: yes
  - Body: none
  - Response: success message

---

## /sessions

- GET /sessions/
  - Auth: yes
  - Query: `status` optional (`all` | `active` | `inactive`) — defaults to `all`.
  - Response: { sessions: [...] } (each session has `sessionId`, `device`, `ipAddress`, `isActive`, timestamps)

- PATCH /sessions/:sessionId
  - Auth: yes
  - Params: `sessionId` (path)
  - Body (JSON): { expiresAt?, isActive? }
  - Response: updated session

- POST /sessions/:sessionId/revoke
  - Auth: yes
  - Params: `sessionId`
  - Body: none
  - Response: updated session (isActive: false)

---

## /url

- GET /url/r/:shortCode
  - Auth: no
  - Params: `shortCode` (path)
  - Response: redirect info (backend handles redirect logic)

- POST /url/create/public
  - Auth: no
  - Body (JSON): { originalUrl, shortCode? }
  - Rate-limited: yes (public rate limiter)
  - Response: { shortUrl }

- POST /url/create
  - Auth: yes
  - Body (JSON): { originalUrl, shortCode?, domainId?, expiresAt? }
  - Response: { shortUrl }

- GET /url/user
  - Auth: yes
  - Query: { limit?, offset? }
  - Response: { items: [...], pagination: { total, limit, offset } }

- GET /url/org
  - Auth: yes
  - Query: { limit?, offset? }
  - Response: same as /url/user but for organization

- GET /url/:urlId
  - Auth: yes
  - Params: `urlId`
  - Response: URL details

- PUT /url/:urlId
  - Auth: yes
  - Params: `urlId`
  - Body (JSON): fields to update (e.g. `domainId`, `expiresAt`, `shortCode` etc.)
  - Response: updated URL

- DELETE /url/:urlId
  - Auth: yes
  - Params: `urlId`
  - Response: success message

---

## /apikey

- POST /apikey/
  - Auth: yes
  - Body (JSON): { name?, scopes?, limits? } (see backend API key creation service)
  - Response: created API key object

- GET /apikey/
  - Auth: yes
  - Response: list of api keys

- PATCH /apikey/:apiKeyId
  - Auth: yes
  - Body: partial api key updates
  - Response: updated api key

- POST /apikey/:apiKeyId/revoke
  - Auth: yes
  - Response: success

- DELETE /apikey/:apiKeyId
  - Auth: yes
  - Response: success

---

## /dashboard

- GET /dashboard/summary
  - Auth: yes
  - Query: none
  - Response: aggregated dashboard data

- GET /dashboard/recent-urls
  - Auth: yes
  - Query: none
  - Response: recent URLs

- GET /dashboard/top-urls
  - Auth: yes
  - Query: none
  - Response: top URLs

---

## /org and /org/dashboard

- POST /org/
  - Auth: yes
  - Body: organization creation payload
  - Response: created organization

- GET /org/me
  - Auth: yes
  - Response: organization info for current user's org

- GET /org/:organizationId
  - Auth: yes
  - Params: `organizationId`
  - Response: organization details

- PATCH /org/:organizationId
  - Auth: yes
  - Body: partial update
  - Response: updated org

- DELETE /org/:organizationId
  - Auth: yes
  - Response: success

- GET /org/dashboard/summary/:organizationId
  - Auth: yes
  - Params: `organizationId`
  - Response: org dashboard summary

---

## /subscription

- GET /subscription/plans
  - Auth: no
  - Response: available subscription plans

- POST /subscription/purchase
  - Auth: yes
  - Body (JSON): purchase payload (plan id, payment details)
  - Response: purchase result

- GET /subscription/current
  - Auth: yes
  - Response: current subscription for user/org

---

## /usage

- GET /usage/current
  - Auth: yes
  - Response: current usage metrics for the user/org

---

## /dev

- POST /dev/custom/create
  - Auth: yes (uses api key middleware)
  - Body: custom creation payload for dev API keys (see backend)

---

## /health

- GET /health/
  - Auth: no
  - Response: liveness

- GET /health/ready
  - Auth: no
  - Response: readiness

- GET /health/full
  - Auth: no
  - Response: full health check

---

Notes:
- For auth-protected endpoints the server accepts JWT `accessToken` cookie. Some endpoints also support token in `Authorization: Bearer <token>` header depending on frontend implementation.
- For endpoints returning paginated lists use `limit` and `offset` query params (defaults applied server-side).
- When in doubt about request/response shapes inspect the controller or service in `src/apis/controllers` and `src/services`.
