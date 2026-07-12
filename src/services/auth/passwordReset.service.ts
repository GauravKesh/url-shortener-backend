import crypto from "crypto";

import { AppError } from "../../utils/AppError.ts";
import { ERRORS, EApplicationEnvironment, MESSAGES } from "../../constants/index.ts";
import config from "../../config/config.ts";
import { CACHE_TTL } from "../../config/cache/cache.ts";
import { sendTemplateEmail } from "./../email/email.service.ts";
import * as sessionService from "../session.service.ts";
import { comparePassword, hashPassword, hashToken } from "../../utils/hash.ts";

import {
  findUserByEmail,
  findUserById,
  findUserByUserId,
  updateUser,
} from "../../repository/user.repository.ts";

import {
  createPasswordResetToken,
  findPasswordResetTokenByHash,
  invalidatePasswordResetTokensByUser,
  markPasswordResetTokenUsed,
} from "../../repository/passwordReset.repository.ts";
import logger from "../../config/log/logger.ts";

export const requestPasswordReset = async (email: string) => {
  const user = await findUserByEmail(email);
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + CACHE_TTL.PASSWORD_RESET * 1000);

  if (!user) {
    return { message: MESSAGES.PASSWORD_RESET_REQUESTED };
  }

  await invalidatePasswordResetTokensByUser(user.id);
  await createPasswordResetToken(user.id, tokenHash, expiresAt);

  const resetUrl = `${config.app.frontendUrl}/auth/password/change?token=${token}`;

  await sendTemplateEmail({
    to: user.email,
    template: "passwordReset",
    variables: {
      resetUrl,
      appName: config.app.name,
    },
  });

  // if (config.app.env === EApplicationEnvironment.DEVELOPMENT) {
  //   return {
  //     message: MESSAGES.PASSWORD_TOKEN_GENERATED,
  //     resetUrl,
  //   };
  // }

  return { message: MESSAGES.PASSWORD_RESET_SENT };
};

export const confirmPasswordReset = async ({
  token,
  userId,
  oldPassword,
  newPassword,
  logoutOtherSessions = false,
  passwordChangeTokenMode = false,
}: {
  token?: string;
  userId?: string;
  oldPassword?: string;
  newPassword: string;
  logoutOtherSessions?: boolean;
  passwordChangeTokenMode?: boolean;
}) => {
  try {
    logger.info("Password update initiated", {
      mode: passwordChangeTokenMode ? "reset_token" : "change_password",
      userId,
    });

    // ==========================
    // Password Reset via Token
    // ==========================
    if (passwordChangeTokenMode) {
      if (!token) {
        throw new AppError(ERRORS.INVALID_RESET_TOKEN);
      }

      const tokenHash = hashToken(token);
      const storedToken = await findPasswordResetTokenByHash(tokenHash);

      console.log(token);

      if (!storedToken) {
        throw new AppError(ERRORS.INVALID_RESET_TOKEN);
      }

      if (storedToken.is_used) {
        throw new AppError(ERRORS.INVALID_RESET_TOKEN);
      }

      if (new Date(storedToken.expires_at) <= new Date()) {
        throw new AppError(ERRORS.EXPIRED_RESET_TOKEN);
      }

      const user = await findUserById(storedToken.user_id);

      if (!user) {
        throw new AppError(ERRORS.USER_NOT_FOUND);
      }

      const isSamePassword = await comparePassword(
        newPassword,
        user.password_hash
      );

      if (isSamePassword) {
        throw new AppError(ERRORS.PASSWORD_SAME_AS_OLD);
      }

      // Optional:
      // if (!isStrongPassword(newPassword)) {
      //   throw new AppError(ERRORS.WEAK_PASSWORD);
      // }

      const hashedPassword = await hashPassword(newPassword);

      await updateUser(user.id, {
        password_hash: hashedPassword,
        password_changed_at: new Date(),
      });

      await markPasswordResetTokenUsed(tokenHash);

      if (logoutOtherSessions) {
        await sessionService.invalidateOtherSessions(user.id);
      }

      logger.info("Password reset completed successfully", {
        userId: user.id,
        logoutOtherSessions,
      });

      return {
        message: MESSAGES.PASSWORD_RESET_SUCCESS,
      };
    }

    // ==========================
    // Change Password
    // ==========================
    console.log(userId);

    if (!userId) {
      throw new AppError(ERRORS.USER_NOT_FOUND);
    }

    if (!oldPassword) {
      throw new AppError(ERRORS.INVALID_CREDENTIALS);
    }

    const user = await findUserById(Number(userId));

    if (!user) {
      throw new AppError(ERRORS.USER_NOT_FOUND);
    }

    const isPasswordValid = await comparePassword(
      oldPassword,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new AppError(ERRORS.INVALID_CREDENTIALS);
    }

    const isSamePassword = await comparePassword(
      newPassword,
      user.password_hash
    );

    if (isSamePassword) {
      throw new AppError(ERRORS.PASSWORD_SAME_AS_OLD);
    }

    // Optional:
    // if (!isStrongPassword(newPassword)) {
    //   throw new AppError(ERRORS.WEAK_PASSWORD);
    // }

    const hashedPassword = await hashPassword(newPassword);

    await updateUser(user.id, {
      password_hash: hashedPassword,
      password_changed_at: new Date(),
    });

    if (logoutOtherSessions) {
      await sessionService.invalidateOtherSessions(user.id);
    }

    logger.info("Password changed successfully", {
      userId: user.id,
      logoutOtherSessions,
    });

    return {
      message: MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  } catch (error) {
    logger.error("Password update failed", {
      mode: passwordChangeTokenMode ? "reset_token" : "change_password",
      userId,
      error,
    });

    throw error;
  }
};
