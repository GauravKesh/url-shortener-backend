import { EApplicationEnvironment } from "../constants/env.ts";
import dotenvFlow from "dotenv-flow";
import type { Algorithm } from "jsonwebtoken";

import ms, { type StringValue } from 'ms';

dotenvFlow.config();

// ---------- helpers ----------
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    //console.log("MONGODB_ANALYTICS_URL:", process.env.MONGODB_ANALYTICS_URL);
    throw new Error(`❌ Missing required env: ${name}`);
  }
  return value;
}

function toNumber(value: string | undefined, fallback: number): number {
  return value ? Number(value) : fallback;
}

function toBoolean(value: string | undefined, fallback = false): boolean {
  return value ? value === "true" : fallback;
}

// ---------- config ----------
const config = {
  app: {
    name: process.env.APP_NAME || "url-shortener",
    env:
      (process.env.NODE_ENV as EApplicationEnvironment) ||
      EApplicationEnvironment.DEVELOPMENT,
    port: toNumber(process.env.PORT, 3000),
    baseUrl: required("BASE_URL"),
    frontendUrl: required("FRONTEND_URL"),
    adminUrl: required("ADMIN_URL"),
  },

  url: {
    shortCodeLength: toNumber(process.env.SHORT_CODE_LENGTH, 6),
    maxUrlLength: toNumber(process.env.MAX_URL_LENGTH, 2048),
    defaultExpiryDays: toNumber(process.env.DEFAULT_EXPIRY_DAYS, 30),
    customAliasEnabled: toBoolean(process.env.CUSTOM_ALIAS_ENABLED),
  },

  db: {
    postgresUrl: required("POSTGRESQL_URL"),
    sslCa: required("POSTGRES_SSL_CA"),
    mongoUrl: required("MONGODB_URL"),
    mongoAnalyticsUrl: required("MONGODB_ANALYTICS_URL"),
    mongoLogsUrl: required("MONGODB_LOGS_URL"),
  },

  redis: {
    url: required("REDIS_URL"),
    ttl: toNumber(process.env.REDIS_TTL, 3600),
  },

  rateLimit: {
    window: toNumber(process.env.RATE_LIMIT_WINDOW, 60),
    max: toNumber(process.env.RATE_LIMIT_MAX, 100),
  },

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiry: ms(required("JWT_ACCESS_EXPIRY") as StringValue),
    refreshExpiry: ms(required("JWT_REFRESH_EXPIRY") as StringValue),
    algorithm: required("JWT_ALGORITHM") as Algorithm,

  },

  apiKey: {
    prefix: process.env.API_KEY_PREFIX || "app",
    length: toNumber(process.env.API_KEY_LENGTH, 32),
    hashSecret: required("API_KEY_HASH_SECRET"),
  },

  security: {
    bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  },

  analytics: {
    trackClicks: toBoolean(process.env.TRACK_CLICKS),
    geoIpKey: process.env.GEOIP_API_KEY || "",
    userAgentParser: toBoolean(process.env.USER_AGENT_PARSER),
  },

  storage: {
    cdnBaseUrl: process.env.CDN_BASE_URL || "",
    s3: {
      bucket: process.env.AWS_S3_BUCKET || "",
      accessKey: process.env.AWS_ACCESS_KEY_ID || "",
      secretKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      region: process.env.AWS_REGION || "ap-south-1",
    },
  },

  email: {
    host: process.env.SMTP_HOST || "",
    port: toNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "",
    provider: process.env.EMAIL_PROVIDER || "smtp",
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    sentryDsn: process.env.SENTRY_DSN || "",
  },

  features: {
    analytics: toBoolean(process.env.ENABLE_ANALYTICS),
    qrCode: toBoolean(process.env.ENABLE_QR_CODE),
    customDomains: toBoolean(process.env.ENABLE_CUSTOM_DOMAINS),
  },

  domains: {
    allowCustom: toBoolean(process.env.ALLOW_CUSTOM_DOMAINS),
    defaultDomain: required("DEFAULT_DOMAIN"),
  },

  queue: {
    name: process.env.QUEUE_NAME || "url-jobs",
    concurrency: toNumber(process.env.WORKER_CONCURRENCY, 5),
  },

  admin: {
    email: process.env.ADMIN_EMAIL || "",
  },
} as const;

export default config;