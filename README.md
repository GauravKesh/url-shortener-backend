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
