import { Router } from "express";

import subscriptionController from "../controllers/subscription.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const subscriptionRouter = Router();



subscriptionRouter.get("/plans", subscriptionController.getPlans);

/* protected routes */
subscriptionRouter.use(authenticate);

/* purchase / upgrade */
subscriptionRouter.post("/purchase", subscriptionController.purchase);

/* current plan */
subscriptionRouter.get("/current", subscriptionController.getCurrent);



export default subscriptionRouter;