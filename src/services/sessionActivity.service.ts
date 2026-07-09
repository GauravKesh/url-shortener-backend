import * as sessionRepo from "../repository/session.repository.ts";

export interface ActivityOptions {
    limit?: number;
    offset?: number;
    since?: string;
}

export interface LoginActivityItem {
    id: string;
    location: string | null;
    device: string | null;
    ipAddress: string | null;
    occurredAt: string | null;
    status: "success" | "expired" | "revoked";
}

export const getUserLoginActivity = async (userId: number, opts: ActivityOptions = {}): Promise<LoginActivityItem[]> => {
  const rows: any[] = await sessionRepo.getLoginActivityByUser(userId, opts as any);

  return rows.map((r) => {
    const expiresAt = r.expires_at ? new Date(r.expires_at) : null;
    const now = new Date();
    let status: LoginActivityItem["status"] = "success";

    // --- NEW: Accurately map status for the frontend ---
    if (expiresAt && expiresAt <= now) {
      status = "expired";
    } else if (!r.is_active) {
      status = "revoked";
    }

    return {
      id: String(r.id),
      location: null,
      device: r.device || r.user_agent || null,
      ipAddress: r.ip_address || null,
      occurredAt: (r.created_at || r.last_used_at) ? new Date(r.created_at || r.last_used_at).toISOString() : null,
      status,
    } as LoginActivityItem;
  });
};

export default { getUserLoginActivity };
