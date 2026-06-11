import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import healthRoutes from "./health.routes.ts";
import { apiRateLimiter } from "../../middleware/apiRateLimiter.middleware.ts";
import urlRoutes from "./url.routes.ts";
import apiKeyRoutes from "./apiKey.routes.ts";
import userRoutes from "./user.routes.ts";
import OrganizationRouter from "./organization.routes.ts";
import subscriptionRouter from "./subscription.routes.ts";
import usageRoutes from "./usage.routes.ts";

const routers = Router();

routers.use(apiRateLimiter(100))
routers.use("/auth", authRoutes);
routers.use("/user", userRoutes);
routers.use("/org", OrganizationRouter);
routers.use("/subscription", subscriptionRouter);
routers.use("/usage", usageRoutes);
routers.use("/apikey", apiKeyRoutes);
routers.use("/health", healthRoutes)
routers.use("/url", urlRoutes)

export default routers;