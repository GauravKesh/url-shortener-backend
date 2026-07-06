import { hashPassword, comparePassword } from "../../utils/hash.ts";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.ts";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts"; // <-- Import Redis

import {
  findUserByEmail,
  createUser
} from "../../repository/user.repository.ts";

import {
  createOrganization,
  findOrgByUser
} from "../../repository/organization.repository.ts";

import {
  createSession,
  findSessionByToken,
  deleteSession,
  getActiveSessions,
  deactivateSession
} from "../../repository/session.repository.ts";

import config from "../../config/config.ts";
import { createSubscription } from "../../repository/subscription.repository.ts";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const CACHE_TTL_ORG = 60 * 60; // 1 hour for org lookup
const CACHE_TTL_SESSION = 60 * 60 * 24 * 7; // 7 days (should match your refresh token expiry)

// HELPERS
const sanitizeUser = (user: any) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

// SIGNUP
export const signup = async ({
  email,
  password,
  organization_name
}: {
  email: string;
  password: string;
  organization_name?: string;
}) => {
  const exists = await findUserByEmail(email);
  if (exists) {
    throw new AppError(ERRORS.USER_ALREADY_EXISTS);
  }

  const hashed = await hashPassword(password);
  const user = await createUser(email, hashed);

  let organization;

  if (organization_name) {
    organization = await createOrganization(
      { name: organization_name },
      user.id
    );
  }

  const freePlan = 1;

  const payload = {
    userId: user.id,
    organizationId: organization?.id,
    role: user.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);

  const session = await createSession({
    userId: user.id,
    tokenHash
  });

  // Cache the new session instantly
  await redisClient.setEx(`session:hash:${tokenHash}`, CACHE_TTL_SESSION, JSON.stringify(session));

  if (organization) {
    await createSubscription(
      Number(organization.id),
      Number(freePlan),
      new Date(),
      null
    );
  }

  return {
    user: sanitizeUser(user),
    organization,
    accessToken,
    refreshToken
  };
};

// LOGIN
export const login = async ({
  email,
  password,
  device,
  ip,
  userAgent
}: {
  email: string;
  password: string;
  device?: string;
  ip?: string;
  userAgent?: string;
}) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(ERRORS.INVALID_CREDENTIALS);
  }

  const valid = await comparePassword(password, user.password_hash);

  if (!valid) {
    throw new AppError(ERRORS.INVALID_CREDENTIALS);
  }

  //  Read-Through Cache for Organization
  const orgCacheKey = `org:byUser:${user.id}`;
  let organization;
  const cachedOrg = await redisClient.get(orgCacheKey);
  
  if (cachedOrg) {
    organization = JSON.parse(cachedOrg);
  } else {
    organization = await findOrgByUser(user.id);
    if (organization) {
      await redisClient.setEx(orgCacheKey, CACHE_TTL_ORG, JSON.stringify(organization));
    }
  }

  // session limit
  const sessions = await getActiveSessions(user.id);

  if (sessions.length >= (user.max_sessions || 2)) {
    const oldSession = sessions[0];
    await deactivateSession(oldSession.id);
    await redisClient.del(`session:hash:${oldSession.token_hash}`); // Clear old session cache
  }

  const payload = {
    userId: user.id,
    organizationId: organization?.id,
    role: user.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);

  const session = await createSession({
    userId: user.id,
    tokenHash,
    device,
    ip,
    userAgent
  });

  // Cache the new session
  await redisClient.setEx(`session:hash:${tokenHash}`, CACHE_TTL_SESSION, JSON.stringify(session));

  return {
    user: sanitizeUser(user),
    organization,
    accessToken,
    refreshToken
  };
};

// REFRESH
export const refresh = async (token: string) => {
  try {
    const hashed = hashToken(token);
    const sessionCacheKey = `session:hash:${hashed}`;

    //  Check Redis Cache for Session
    let session;
    const cachedSession = await redisClient.get(sessionCacheKey);
    
    if (cachedSession) {
      session = JSON.parse(cachedSession);
    } else {
      session = await findSessionByToken(hashed);
      if (session) {
        await redisClient.setEx(sessionCacheKey, CACHE_TTL_SESSION, JSON.stringify(session));
      }
    }

    if (!session || !session.is_active) {
      throw new AppError(ERRORS.INVALID_SESSION);
    }

    const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;

    const payload = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role,
    };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    const newTokenHash = hashToken(newRefreshToken);

    // rotate — delete old from DB & Redis
    await deleteSession(hashed);
    await redisClient.del(sessionCacheKey);

    // create new in DB & Redis
    const newSession = await createSession({
      userId: decoded.userId,
      tokenHash: newTokenHash,
    });
    
    await redisClient.setEx(`session:hash:${newTokenHash}`, CACHE_TTL_SESSION, JSON.stringify(newSession));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(ERRORS.INVALID_SESSION);
  }
};

// LOGOUT
export const logout = async (token: string) => {
  const hashed = hashToken(token);
  
  // Delete from both DB and Redis
  await deleteSession(hashed);
  await redisClient.del(`session:hash:${hashed}`);
};