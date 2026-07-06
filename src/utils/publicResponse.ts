const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
};

const toCamelCase = (value: string) =>
  value.replace(/_([a-z])/g, (_, character: string) => character.toUpperCase());

export const toPublicResponse = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => toPublicResponse(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const publicValue: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (key === "id" || key === "_id") {
      continue;
    }

    publicValue[toCamelCase(key)] = toPublicResponse(entry);
  }

  return publicValue as T;
};