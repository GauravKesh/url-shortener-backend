import { hashPassword, comparePassword } from "../../utils/hash.ts";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.ts";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts";

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
import logger from "../../config/log/logger.ts";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const CACHE_TTL_ORG = 60 * 60;
const CACHE_TTL_SESSION = 60 * 60 * 24 * 7;

const sanitizeUser = (user: any) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

// SIGNUP
export const signup = async ({
  email,
  password,
  organization_name,
  ip
}: {
  email: string;
  password: string;
  organization_name?: string;
  ip?: string
}) => {
  logger.info("Initiating user signup", { email });

  const exists = await findUserByEmail(email);
  if (exists) {
    logger.warn("Signup failed: User already exists", { email });
    throw new AppError(ERRORS.USER_ALREADY_EXISTS);
  }

  const hashed = await hashPassword(password);
  const user = await createUser(email, hashed);
  logger.info("User record created successfully", { userId: user.id });

  let organization;

  if (organization_name) {
    organization = await createOrganization(
      { name: organization_name },
      user.id
    );
    logger.info("Organization created for new user", { userId: user.id, orgId: organization.id });
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

  await redisClient.setEx(`session:hash:${tokenHash}`, CACHE_TTL_SESSION, JSON.stringify(session));
  logger.debug("Session cached in Redis", { userId: user.id });

  if (organization) {
    await createSubscription(
      Number(organization.id),
      Number(freePlan),
      new Date(),
      null
    );
    logger.info("Free subscription created for organization", { orgId: organization.id });
  }

  logger.info("Signup process completed successfully", { userId: user.id });

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
  userAgent,
}: {
  email: string;
  password: string;
  device?: string;
  ip?: string;
  userAgent?: string;
}) => {
  logger.info("Login attempt", { email, ip });

  const user = await findUserByEmail(email);

  if (!user) {
    logger.warn("Login failed: User not found", { email, ip });
    throw new AppError(ERRORS.INVALID_CREDENTIALS);
  }

  const valid = await comparePassword(password, user.password_hash);

  if (!valid) {
    logger.warn("Login failed: Invalid password", {
      userId: user.id,
      ip,
    });
    throw new AppError(ERRORS.INVALID_CREDENTIALS);
  }

  const orgCacheKey = `org:byUser:${user.id}`;

  let organization;
  const cachedOrg = await redisClient.get(orgCacheKey);

  if (cachedOrg) {
    organization = JSON.parse(cachedOrg);
  } else {
    organization = await findOrgByUser(user.id);

    if (organization) {
      await redisClient.setEx(
        orgCacheKey,
        CACHE_TTL_ORG,
        JSON.stringify(organization)
      );
    }
  }

  const sessions = await getActiveSessions(user.id);
  const maxSessions = user.max_sessions || 2;

  // if (sessions.length >= maxSessions) {
  //   try {
  //     const oldSession = sessions[0];

  //     const sessionId = oldSession.id || oldSession._id;
  //     const sessionHash = oldSession.token_hash || oldSession.tokenHash;

  //     if (sessionId) {
  //       await deactivateSession(sessionId);
  //     }

  //     if (sessionHash) {
  //       await redisClient.del(`session:hash:${sessionHash}`);
  //     }
  //   } catch (error) {
  //     logger.warn("Failed to clean up old session", {
  //       userId: user.id,
  //       error,
  //     });
  //   }
  // }

  if (sessions.length >= maxSessions) {
  logger.warn("Login blocked: Maximum active sessions reached", {
    userId: user.id,
    activeSessions: sessions.length,
    maxSessions,
  });

  throw new AppError(ERRORS.SESSION_LIMIT_REACHED);
}
  const payload = {
    userId: user.id,
    organizationId: organization?.id,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);

  const session = await createSession({
    userId: user.id,
    tokenHash,
    device,
    ip,
    userAgent,
  });

  if (!session) {
    logger.error("Failed to create login session", {
      userId: user.id,
    });

    throw new AppError(ERRORS.INTERNAL);
  }

  await redisClient.setEx(
    `session:hash:${tokenHash}`,
    CACHE_TTL_SESSION,
    JSON.stringify(session)
  );

  logger.info("Login successful", {
    userId: user.id,
    organizationId: organization?.id,
    sessionId: session.id,
    ip,
    device,
  });

  return {
    user: sanitizeUser(user),
    organization,
    accessToken,
    refreshToken,
  };
};

// REFRESH
export const refresh = async (token: string, ip?: string) => {
  try {
    const hashed = hashToken(token);
    const sessionCacheKey = `session:hash:${hashed}`;

    logger.info("Refresh token rotation initiated", {});

    let session;
    const cachedSession = await redisClient.get(sessionCacheKey);

    if (cachedSession) {
      logger.debug("Session fetch: Redis cache hit", {});
      session = JSON.parse(cachedSession);
    } else {
      logger.debug("Session fetch: Redis cache miss, fetching from DB", {});
      session = await findSessionByToken(hashed);
      if (session) {
        await redisClient.setEx(sessionCacheKey, CACHE_TTL_SESSION, JSON.stringify(session));
      }
    }

    if (!session || !session.is_active) {
      logger.warn("Token refresh failed: Invalid or inactive session", {});
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

    await deleteSession(hashed);
    await redisClient.del(sessionCacheKey);
    logger.debug("Old session deleted", { userId: decoded.userId });

    const newSession = await createSession({
      userId: decoded.userId,
      tokenHash: newTokenHash,
    });

    await redisClient.setEx(`session:hash:${newTokenHash}`, CACHE_TTL_SESSION, JSON.stringify(newSession));

    logger.info("Token refreshed successfully", { userId: decoded.userId });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    logger.error("Token refresh encountered an error", { err });
    if (err instanceof AppError) throw err;
    throw new AppError(ERRORS.INVALID_SESSION);
  }
};

// LOGOUT
export const logout = async (token: string, ip?: string) => {
  try {
    const hashed = hashToken(token);
    logger.info("Logout initiated", {});

    await deleteSession(hashed);
    await redisClient.del(`session:hash:${hashed}`);

    logger.info("Logout completed, session destroyed", {});
  } catch (err) {
    logger.error("Error occurred during logout", { err });
    throw err;
  }
};

export const resetUserSessions = async (userId: number) => {
  try {
    logger.info("Initiating manual session reset", { userId });

    // 1. Get all active sessions for this user
    const sessions = await getActiveSessions(userId);

    if (!sessions || sessions.length === 0) {
      logger.info("No active sessions found to reset", { userId });
      return { message: "No active sessions found" };
    }

    // 2. Iterate and delete from both DB and Redis
    for (const session of sessions) {
      // Safely access properties just in case of snake_case vs camelCase mismatch
      const sessionId = session.id || session._id;
      const sessionHash = session.token_hash || session.tokenHash;

      if (sessionId) {
        await deactivateSession(sessionId); // Or deleteSession() depending on your preference
      }

      if (sessionHash) {
        await redisClient.del(`session:hash:${sessionHash}`);
      }
    }

    logger.info("Successfully reset all user sessions", { userId, count: sessions.length });

    return {
      message: `Successfully cleared ${sessions.length} session(s)`
    };
  } catch (err) {
    logger.error("Failed to reset user sessions", { err, userId });
    throw err;
  }
};