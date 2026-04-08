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

## 📁 Project Structure

```bash

├── docker
│   └── Dockerfile
├── docker-compose.yml
├── logs
│   ├── combined.log
│   └── error.log
├── migrations
│   └── sql
│       ├── 0002_init.sql
│       └── 001_init.sql
├── nginix
├── package-lock.json
├── package.json
├── public
├── README.md
├── scripts
├── src
│   ├── apis
│   │   ├── controllers
│   │   │   ├── apiKey.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── health.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── organization.controller.ts
│   │   │   ├── subscription.controller.ts
│   │   │   ├── url.controller.ts
│   │   │   ├── usage.controller.ts
│   │   │   └── user.controller.ts
│   │   └── routes
│   │       ├── apiKey.routes.ts
│   │       ├── auth.routes.ts
│   │       ├── health.routes.ts
│   │       ├── index.ts
│   │       └── url.routes.ts
│   ├── app.ts
│   ├── config
│   │   ├── cache
│   │   │   └── redis.ts
│   │   ├── config.ts
│   │   ├── database
│   │   │   ├── mongodb.ts
│   │   │   └── postgresql.ts
│   │   ├── index.ts
│   │   ├── log
│   │   │   └── logger.ts
│   │   └── queue
│   │       └── kafka.ts
│   ├── constants
│   │   ├── env.ts
│   │   ├── errors.ts
│   │   ├── http-status.ts
│   │   ├── index.ts
│   │   ├── messages.ts
│   │   ├── permissions.ts
│   │   ├── rbac.ts
│   │   └── roles.ts
│   ├── middleware
│   │   ├── apiKey.middleware.ts
│   │   ├── apiRateLimiter.middleware.ts
│   │   ├── authentication.middleware.ts
│   │   ├── authorization.middleware.ts
│   │   ├── csrf.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── globalRateLimiter.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── requestId.middleware.ts
│   │   └── requestLogger.middleware.ts
│   ├── models
│   │   ├── apiKey.model.ts
│   │   ├── domain.model.ts
│   │   ├── organization.model.ts
│   │   ├── subscription.model.ts
│   │   ├── url.model.ts
│   │   └── user.model.ts
│   ├── repository
│   │   ├── api.key.repository.ts
│   │   ├── organization.repository.ts
│   │   ├── refreshToken.repository.ts
│   │   ├── session.repository.ts
│   │   ├── subscription.repository.ts
│   │   ├── subscriptionPlan.repository.ts
│   │   ├── url.repository.ts
│   │   ├── usage.repository.ts
│   │   └── user.repository.ts
│   ├── scripts
│   │   ├── db.init.ts
│   │   └── migrate.ts
│   ├── server.ts
│   ├── services
│   │   ├── apiKey.service.ts
│   │   ├── auth
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.service.ts
│   │   ├── kafka.producer.service.ts
│   │   ├── notification.service.ts
│   │   ├── subscription.service.ts
│   │   └── url.service.ts
│   ├── types
│   │   ├── express.d.ts
│   │   └── types.ts
│   └── utils
│       ├── AppError.ts
│       ├── hash.ts
│       ├── httpError.ts
│       ├── httpRequest.ts
│       ├── httpResponse.ts
│       ├── jwt.ts
│       ├── throwError.ts
│       └── token.utils.ts
├── test
└── tsconfig.json

27 directories, 86 files
```

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

**Gaurav Kesh Roushan**
Backend Developer | Open Source Contributor

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
