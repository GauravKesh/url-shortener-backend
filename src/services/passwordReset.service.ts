import crypto from "crypto";

import { AppError } from "../utils/AppError.ts";
import { ERRORS, EApplicationEnvironment } from "../constants/index.ts";
import config from "../config/config.ts";
import { CACHE_TTL } from "../config/cache/cache.ts";
import { sendTemplateEmail } from "./email.service.ts";
import * as sessionService from "./session.service.ts";
import { hashPassword, hashToken } from "../utils/hash.ts";

import {
  findUserByEmail,
  findUserById,
  updateUser,
} from "../repository/user.repository.ts";

import {
  createPasswordResetToken,
  findPasswordResetTokenByHash,
  invalidatePasswordResetTokensByUser,
  markPasswordResetTokenUsed,
} from "../repository/passwordReset.repository.ts";

export const requestPasswordReset = async (email: string) => {
  const user = await findUserByEmail(email);
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + CACHE_TTL.PASSWORD_RESET * 1000);

  if (!user) {
    return { message: "If an account exists, a reset link has been sent." };
  }

  await invalidatePasswordResetTokensByUser(user.id);
  await createPasswordResetToken(user.id, tokenHash, expiresAt);

  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${token}`;

  await sendTemplateEmail({
    to: user.email,
    template: "passwordReset",
    variables: {
      resetUrl,
      appName: config.app.name,
    },
  });

  if (config.app.env === EApplicationEnvironment.DEVELOPMENT) {
    return {
      message: "Password reset token generated.",
      resetUrl,
    };
  }

  return { message: "If an account exists, a reset link has been sent." };
};

export const confirmPasswordReset = async (
  token: string,
  newPassword: string,
  logoutOtherSessions = false
) => {
  const tokenHash = hashToken(token);
  const storedToken = await findPasswordResetTokenByHash(tokenHash);

  if (
    !storedToken ||
    storedToken.is_used ||
    new Date(storedToken.expires_at) <= new Date()
  ) {
    throw new AppError(ERRORS.INVALID_TOKEN);
  }

  const user = await findUserById(storedToken.user_id);
  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  const hashedPassword = await hashPassword(newPassword);

  await updateUser(user.id, {
    password_hash: hashedPassword,
    password_changed_at: new Date(),
  });

  await markPasswordResetTokenUsed(tokenHash);

  if (logoutOtherSessions) {
    await sessionService.invalidateOtherSessions(user.id);
  }

  return { message: "Password has been reset successfully." };
};
