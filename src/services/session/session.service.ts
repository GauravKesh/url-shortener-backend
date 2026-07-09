import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";
import {
  createSession as createSessionRepo,
  findSessionByToken as findSessionByTokenRepo,
  findSessionById as findSessionByIdRepo,
  invalidateSessionByHash as invalidateSessionByHashRepo,
  getActiveSessions as getActiveSessionsRepo,
  getSessionsByUser as getSessionsByUserRepo,
  updateSessionById as updateSessionByIdRepo,
  deactivateSession as deactivateSessionRepo,
} from "../../repository/session.repository.ts";

export const createSession = async (data: any) => {
  return createSessionRepo(data);
};

export const findSessionByToken = async (hash: string) => {
  return findSessionByTokenRepo(hash);
};

export const invalidateSessionByHash = async (hash: string) => {
  return invalidateSessionByHashRepo(hash);
};

export const getActiveSessions = async (userId: number) => {
  return getActiveSessionsRepo(userId);
};

export const listUserSessions = async (
  userId: number,
  status: "active" | "inactive" | "all" = "all"
) => {
  return getSessionsByUserRepo(userId);
  // return getSessionsByUserRepo(userId, status);
};

export const updateUserSession = async (
  userId: number,
  sessionId: number,
  updates: { expiresAt?: string | Date; isActive?: boolean }
) => {
  const session = await findSessionByIdRepo(sessionId);

  if (!session || session.user_id !== userId) {
    throw new AppError(ERRORS.NOT_FOUND);
  }

  const updatePayload: {
    expires_at?: Date;
    is_active?: boolean;
  } = {};

  if (updates.expiresAt !== undefined) {
    updatePayload.expires_at =
      updates.expiresAt instanceof Date
        ? updates.expiresAt
        : new Date(updates.expiresAt);
  }

  if (updates.isActive !== undefined) {
    updatePayload.is_active = updates.isActive;
  }

  return updateSessionByIdRepo(sessionId, updatePayload);
};

export const resetUserSessions = async (userId: number) => {
  const sessions = await getActiveSessionsRepo(userId);

  if (!sessions || sessions.length === 0) {
    return { message: "No active sessions found" };
  }

  for (const session of sessions) {
    const sessionId = session.id || session._id;

    if (sessionId) {
      await deactivateSessionRepo(sessionId);
    }
  }

  return {
    message: `Successfully cleared ${sessions.length} session(s)`,
  };
};
