export interface IUser {
  id: number;
  user_id: string;

  email: string;
  password_hash: string;

  name?: string;
  avatar_url?: string;

  is_active: boolean;
  is_verified: boolean;

  last_login_at?: Date;
  password_changed_at?: Date;

  max_sessions: number;

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

/* user without sensitive fields */
export type IUserSafe = Omit<IUser, "password_hash">;

/* payload used in JWT */
export interface IUserTokenPayload {
  userId: number;
  organizationId?: number;
  tenantId?: string;
}

/* signup input */
export interface ISignupInput {
  email: string;
  password: string;
  organization_name?: string;
}

/* login input */
export interface ILoginInput {
  email: string;
  password: string;
  device?: string;
  ip?: string;
  userAgent?: string;
}

/* update profile input */
export interface IUpdateUserInput {
  name?: string;
  avatar_url?: string;
}

/* change password input */
export interface IChangePasswordInput {
  userId: number;
  oldPassword: string;
  newPassword: string;
  logoutOtherSessions?: boolean;
  currentSessionHash?: string;
}

export interface IPasswordResetRequestInput {
  email: string;
}

export interface IPasswordResetConfirmInput {
  token: string;
  newPassword: string;
  logoutOtherSessions?: boolean;
}