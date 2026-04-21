import { Router } from "express";

import usageController from "../controllers/usage.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const usageRouter = Router();

usageRouter.use(authenticate);

usageRouter.get("/current", usageController.getCurrent);

export default usageRouter;
