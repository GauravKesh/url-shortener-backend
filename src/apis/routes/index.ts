import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import healthRoutes from "./health.routes.ts";
import { apiRateLimiter } from "../../middleware/apiRateLimiter.middleware.ts";

const routers = Router();

routers.use("/auth",apiRateLimiter(10), authRoutes);
routers.use("/health",healthRoutes)

export default routers;