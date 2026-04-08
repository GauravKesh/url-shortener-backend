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
  Create short URL
*/
urlRoutes.post("/create", authenticate, create);

/*
  Get URLs (separated)
*/
urlRoutes.get("/user", authenticate, getUserUrls);
urlRoutes.get("/org", authenticate, getOrgUrls);

/*
  Get single URL
*/
urlRoutes.get("/:id", authenticate, getOne);

/*
  Update URL
*/
urlRoutes.put("/:id", authenticate, update);

/*
  Delete URL (soft delete)
*/
urlRoutes.delete("/:id", authenticate, deleteUrl);

/*
  Public redirect (no auth)
*/
urlRoutes.get("/r/:shortCode", redirect);

export default urlRoutes;