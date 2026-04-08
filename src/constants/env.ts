export const EApplicationEnvironment = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export type EApplicationEnvironment =
  typeof EApplicationEnvironment[keyof typeof EApplicationEnvironment];