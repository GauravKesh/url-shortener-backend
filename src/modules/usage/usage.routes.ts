import { Router } from "express";

import { authenticate } from "../../middleware/authentication.middleware.ts";
import usageController from "./usage.controller.ts";

const usageRouter = Router();

usageRouter.use(authenticate);

usageRouter.get("/current", usageController.getCurrent);

export default usageRouter;
