import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import healthRoutes from "./health.routes.ts";
import { apiRateLimiter } from "../../middleware/apiRateLimiter.middleware.ts";
import urlRoutes from "./url.routes.ts";

const routers = Router();

routers.use("/auth",apiRateLimiter(10), authRoutes);
routers.use("/health",healthRoutes)
routers.use("/url",apiRateLimiter(10),urlRoutes)

export default routers;