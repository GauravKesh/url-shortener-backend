export enum Permission {
  // 🔹 URL actions
  URL_CREATE = "url:create",
  URL_READ = "url:read",
  URL_UPDATE = "url:update",
  URL_DELETE = "url:delete",
  URL_ANALYTICS = "url:analytics",

  //  API KEY actions
  API_KEY_CREATE = "apikey:create",
  API_KEY_READ = "apikey:read",
  API_KEY_UPDATE = "apikey:update",
  API_KEY_DELETE = "apikey:delete",

  //  user / system
  USER_MANAGE = "user:manage",
  SYSTEM_ADMIN = "system:admin",
}