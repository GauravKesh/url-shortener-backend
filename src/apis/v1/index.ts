import { Router } from "express";

import authRoutes from "../routes/auth.routes.ts";
import healthRoutes from "../routes/health.routes.ts";
import urlRoutes from "../../modules/url/routes/url.routes.ts";
import apiKeyRoutes from "../routes/apiKey.routes.ts";
import userRoutes from "../routes/user.routes.ts";
import organizationRoutes from "../routes/organization.routes.ts";
import subscriptionRoutes from "../routes/subscription.routes.ts";
import usageRoutes from "../routes/usage.routes.ts";
import dashboardRoutes from "../routes/dashboard.routes.ts";
import devApiKeyRoutes from "../routes/devApiKey.routes.ts";
import orgDashboardRoutes from "../routes/orgdashboard.routes.ts";
import { apiRateLimiter } from "../../middleware/apiRateLimiter.middleware.ts";

const v1Router = Router();

v1Router.use(apiRateLimiter(100));
v1Router.use("/auth", authRoutes);
v1Router.use("/dashboard", dashboardRoutes);
v1Router.use("/user", userRoutes);
v1Router.use("/org", organizationRoutes);
v1Router.use("/org/dashboard", orgDashboardRoutes);
v1Router.use("/subscription", subscriptionRoutes);
v1Router.use("/usage", usageRoutes);
v1Router.use("/apikey", apiKeyRoutes);
v1Router.use("/dev", devApiKeyRoutes);
v1Router.use("/health", healthRoutes);
v1Router.use("/url", urlRoutes);

export default v1Router;