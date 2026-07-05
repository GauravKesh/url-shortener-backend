import { Router } from "express";

import orgController from "../controllers/organization.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const OrganizationRouter = Router();

/* all org routes require auth */
OrganizationRouter.use(authenticate);

/* create organization */
OrganizationRouter.post("/", orgController.create);

/* get current user's organization (Fixed typo here) */
OrganizationRouter.get("/me", orgController.me);

/* get organization by id */
OrganizationRouter.get("/:organizationId", orgController.getOne);

/* update organization */
OrganizationRouter.patch("/:organizationId", orgController.update);

/* delete organization */
OrganizationRouter.delete("/:organizationId", orgController.delete);

export default OrganizationRouter;