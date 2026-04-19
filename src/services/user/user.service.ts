import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

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

/* remove sensitive fields */
const sanitizeUser = (user: IUser): IUserSafe => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

export const getUserById = async (userId: number): Promise<IUserSafe> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  return sanitizeUser(user);
};

export const getUserByEmail = async (
  email: string
): Promise<IUserSafe> => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(ERRORS.USER_NOT_FOUND);
  }

  return sanitizeUser(user);
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

  return sanitizeUser(updated);
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

  return true;
};