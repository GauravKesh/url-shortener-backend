import pool from "../config/database/postgresql.ts";
import type {
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
} from "../types/organization.ts";

export const createOrganization = async (
  payload: CreateOrganizationPayload,
  ownerId: number
) => {
  const { name } = payload;

  const { rows } = await pool.query(
    `
    INSERT INTO organizations (
      name,
      owner_id
    )
    VALUES ($1, $2)
    RETURNING *
    `,
    [name, ownerId]
  );

  return rows[0];
};

export const findOrgByPublicId = async (publicId: string) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM organizations
    WHERE public_id = $1
      AND deleted_at IS NULL
    `,
    [publicId]
  );

  return rows[0] ?? null;
};

export const findOrgByUser = async (userId: number) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM organizations
    WHERE owner_id = $1
      AND deleted_at IS NULL
    `,
    [userId]
  );

  return rows[0] ?? null;
};

export const updateOrganization = async (
  publicId: string,
  updates: UpdateOrganizationPayload & { current_plan?: string }
) => {
  const allowedFields = [
    "name",
    "display_name",
    "slug",
    "description",
    "current_plan", 
    "website_url",
    "logo_url",
    "support_email",
    "phone_number",
    "timezone",
    "country",
    "address",
    "settings",
    "metadata",
    "custom_limits",
    "is_active",
    "is_verified",
    "require_sso",
    "enforce_2fa",
  ];

  const jsonbFields = new Set([
    "address",
    "settings",
    "metadata",
    "custom_limits",
  ]);

  const filteredEntries = Object.entries(updates).filter(
    ([key, value]) => {
      if (!allowedFields.includes(key)) {
        return false;
      }

      // remove undefined/null
      if (value === undefined || value === null) {
        return false;
      }

      // remove empty strings
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return false;
      }

      return true;
    }
  );

  if (filteredEntries.length === 0) {
    return null;
  }

  const values: unknown[] = [];

  const setClause = filteredEntries
    .map(([key, value], index) => {
      // stringify JSONB fields
      if (jsonbFields.has(key)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }

      return `${key} = $${index + 1}`;
    })
    .join(", ");

  values.push(publicId);

  const { rows } = await pool.query(
    `
    UPDATE organizations
    SET
      ${setClause},
      updated_at = NOW()
    WHERE public_id = $${values.length}
      AND deleted_at IS NULL
    RETURNING *
    `,
    values
  );

  return rows[0] ?? null;
};

export const deleteOrganization = async (publicId: string) => {
  const { rows } = await pool.query(
    `
    UPDATE organizations
    SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE public_id = $1
      AND deleted_at IS NULL
    RETURNING *
    `,
    [publicId]
  );

  return rows[0] ?? null;
};


export const getOrganizationCurrentPlan = async (
  id: number
): Promise<string | null> => {
  const { rows } = await pool.query(
    `
    SELECT current_plan
    FROM organizations
    WHERE id = $1
      AND deleted_at IS NULL
    `,
    [id]
  );

  return rows[0]?.current_plan ?? null;
};