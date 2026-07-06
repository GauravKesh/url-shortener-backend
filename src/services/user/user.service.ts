import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import redisClient from "../../config/cache/redis.ts";

import {
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser
} from "../../repository/user.repository.ts";

import { hashPassword, comparePassword } from "../../utils/hash.ts";

import type {
  IUser,
  IUserSafe,
  IUpdateUserInput,
  IChangePasswordInput
} from "../../types/user.ts";

const CACHE_TTL = 60 * 15;

/* remove sensitive fields */
const sanitizeUser = (user: IUser): IUserSafe => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

/* helper to invalidate user caches to prevent stale data */
const invalidateUserCache = async (user: IUser | IUserSafe) => {
  try {
    if (user.id) await redisClient.del(`user:id:${user.id}`);
    if (user.email) await redisClient.del(`user:email:${user.email}`);
  } catch (err) {
    console.error(`Failed to invalidate cache for user ${user.id}:`, err);
  }
};

export const getUserById = async (userId: number): Promise<IUserSafe> => {
  const cacheKey = `user:id:${userId}`;

  // Check Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from DB
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  const safeUser = sanitizeUser(user);

  // Cache the sanitized user
  redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(safeUser))
    .catch(err => console.error(`Failed to cache user ${userId}:`, err));

  return safeUser;
};

export const getUserByEmail = async (
  email: string
): Promise<IUserSafe> => {
  const cacheKey = `user:email:${email}`;

  // Check Cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  //  Fetch from DB
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  const safeUser = sanitizeUser(user);

  // Cache the sanitized user
  redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(safeUser))
    .catch(err => console.error(`Failed to cache user email ${email}:`, err));

  return safeUser;
};

export const updateProfile = async (
  userId: number,
  updates: IUpdateUserInput
): Promise<IUserSafe> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  const updated = await updateUser(userId, updates);
  const safeUser = sanitizeUser(updated);

  // Invalidate BOTH the old email (if it changed) and the new data
  await invalidateUserCache(user);
  await invalidateUserCache(safeUser);

  return safeUser;
};

export const changePassword = async ({
  userId,
  oldPassword,
  newPassword
}: IChangePasswordInput): Promise<boolean> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  const isValid = await comparePassword(
    oldPassword,
    user.password_hash
  );

  if (!isValid) {
    throw new AppError(ERRORS.INVALID_CREDENTIALS);
  }

  const hashed = await hashPassword(newPassword);

  await updateUser(userId, {
    password_hash: hashed,
    password_changed_at: new Date()
  });

  // Invalidate cache since password_changed_at likely updated on the profile
  await invalidateUserCache(user);

  return true;
};

export const removeUser = async (
  userId: number
): Promise<boolean> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  await deleteUser(userId);

  // Clear cache to prevent retrieving deleted user
  await invalidateUserCache(user);

  return true;
};