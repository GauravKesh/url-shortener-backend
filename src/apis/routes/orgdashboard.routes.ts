import { Router } from "express";
import orgDashboardController from "../controllers/orgDashboard.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const orgDashboardRouter = Router();

/* Middleware verification barrier */
orgDashboardRouter.use(authenticate);

/* Fetch consolidated metrics dataset */
orgDashboardRouter.get("/summary/:orgPublicId", orgDashboardController.getSummary);

export default orgDashboardRouter;