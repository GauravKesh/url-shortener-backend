import { Router } from "express";

import {
  create,
  getUserUrls,
  getOrgUrls,
  getOne,
  update,
  deleteUrl,
  redirect,
} from "../controllers/url.controller.ts";

import { authenticate } from "../../middleware/authentication.middleware.ts";

const urlRoutes = Router();


/*
  Public redirect (no auth)
*/
urlRoutes.get("/r/:shortCode", redirect);

/*
  protected auth
*/

urlRoutes.use(authenticate)

/*
  Create short URL
*/
urlRoutes.post("/create", create);

/*
  Get URLs (separated)
*/
urlRoutes.get("/user", getUserUrls);
urlRoutes.get("/org", getOrgUrls);

/*
  Get single URL
*/
urlRoutes.get("/:id", getOne);

/*
  Update URL
*/
urlRoutes.put("/:id", update);

/*
  Delete URL (soft delete)
*/
urlRoutes.delete("/:id", deleteUrl);



export default urlRoutes;