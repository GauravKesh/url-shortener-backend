import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import healthRoutes from "./health.routes.ts";
import { apiRateLimiter } from "../../middleware/apiRateLimiter.middleware.ts";
import urlRoutes from "./url.routes.ts";
import apiKeyRoutes from "./apiKey.routes.ts";
import userRoutes from "./user.routes.ts";
import OrganizationRouter from "./organization.routes.ts";
import subscriptionRouter from "./subscription.routes.ts";

const routers = Router();

routers.use("/auth", apiRateLimiter(10), authRoutes);
routers.use("/user", apiRateLimiter(10), userRoutes);
routers.use("/org", apiRateLimiter(10), OrganizationRouter);
routers.use("/subscription", apiRateLimiter(10), subscriptionRouter);
routers.use("/apikey", apiRateLimiter(10), apiKeyRoutes);
routers.use("/health", healthRoutes)
routers.use("/url", apiRateLimiter(10), urlRoutes)

export default routers;