import { hashPassword, comparePassword } from "../../utils/hash.ts";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.ts";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

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

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");


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

  let organization = null;

  if (organization_name) {
    organization = await createOrganization(
      organization_name,
      user.id
    );
  }

  const payload = {
    userId: user.id,
    organizationId: organization?.id,
    role:user.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createSession({
    userId: user.id,
    tokenHash: hashToken(refreshToken)
  });

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

  const valid = await comparePassword(
    password,
    user.password_hash
  );

  if (!valid) {
    throw new AppError(ERRORS.INVALID_CREDENTIALS);
  }
  
  const organization = await findOrgByUser(user.id);

  // session limit
  const sessions = await getActiveSessions(user.id);

  if (sessions.length >= (user.max_sessions || 2)) {
    await deactivateSession(sessions[0].id);
  }

  const payload = {
    userId: user.id,
    organizationId: organization?.id,
    role:user.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createSession({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    device,
    ip,
    userAgent
  });

  return {
    user: sanitizeUser(user),
    organization,
    accessToken,
    refreshToken
  };
};


// REFRESH

// REFRESH
export const refresh = async (token: string) => {
  try {
    const hashed = hashToken(token);
    const session = await findSessionByToken(hashed);

    if (!session || !session.is_active) {
      throw new AppError(ERRORS.INVALID_SESSION);
    }

    const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;

    const payload = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role,         // ✅ was missing in login payload too (see below)
    };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    // rotate — delete old, create new
    await deleteSession(hashed);
    await createSession({
      userId: decoded.userId,
      tokenHash: hashToken(newRefreshToken),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    // ✅ Rethrow so the controller returns 401, not 500
    if (err instanceof AppError) throw err;
    throw new AppError(ERRORS.INVALID_SESSION);
  }
};


// LOGOUT

export const logout = async (token: string) => {
  const hashed = hashToken(token);
  await deleteSession(hashed);
};