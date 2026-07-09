import { Router } from "express";
import sessionController from "../controllers/session.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const sessionRouter = Router();

sessionRouter.use(authenticate);

sessionRouter.get("/", sessionController.list);
sessionRouter.patch("/:sessionId", sessionController.update);
sessionRouter.post("/:sessionId/revoke", sessionController.revoke);

export default sessionRouter;
