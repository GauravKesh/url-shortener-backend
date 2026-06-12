import { AppError } from "../../utils/AppError.ts";
import { ERRORS } from "../../constants/index.ts";

import {
  getUsage,
  createUsage,
  incrementUsage
} from "./usage.repository.ts";

/* allowed fields (prevent SQL injection via field param) */
const ALLOWED_FIELDS = [
  "url_count",
  "api_calls",
  "clicks"
] as const;

type UsageField = typeof ALLOWED_FIELDS[number];

/* get start of current month */
const getCurrentPeriod = () => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { start, end };
};

/* ensure usage row exists */
export const ensureUsage = async (orgId: number) => {
  const { start, end } = getCurrentPeriod();

  let usage = await getUsage(orgId, start);

  if (!usage) {
    usage = await createUsage(orgId, start, end);
  }

  return usage;
};

/* increment usage safely */
export const increment = async (
  orgId: number,
  field: UsageField
) => {
  if (!ALLOWED_FIELDS.includes(field)) {
    throw new AppError(ERRORS.BAD_REQUEST);
  }

  const { start } = getCurrentPeriod();

  /* ensure row exists */
  await ensureUsage(orgId);

  await incrementUsage(orgId, field, start);
};

/* get current usage */
export const getCurrentUsage = async (orgId: number) => {
  const { start } = getCurrentPeriod();

  const usage = await getUsage(orgId, start);

  if (!usage) {
    return await ensureUsage(orgId);
  }

  return usage;
};