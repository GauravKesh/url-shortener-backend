import { Router } from "express";

import {
  create,
  getAll,
  update,
  revoke,
  deleteApiKey
} from "../controllers/apiKey.controller.ts";

import { authenticate } from "../../middleware/authentication.middleware.ts";

const apiKeyRoute = Router();
apiKeyRoute.use(authenticate)


// API KEY ROUTES

// Create API Key
apiKeyRoute.post("/", create);

// Get all API Keys (org scoped)
apiKeyRoute.get("/", getAll);

// Update API Key
apiKeyRoute.patch("/:id", update);

// Revoke API Key
apiKeyRoute.post("/:id/revoke", revoke);

// Delete API Key
apiKeyRoute.delete("/:id", deleteApiKey);


export default apiKeyRoute;