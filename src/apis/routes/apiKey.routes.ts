import { Router } from "express";

import {
  create,
  getAll,
  update,
  revoke,
  deleteApiKey
} from "../controllers/apiKey.controller.ts";

import { authenticate } from "../../middleware/authentication.middleware.ts";

const apiKeyRoute= Router();


// API KEY ROUTES

// Create API Key
apiKeyRoute.post("/", authenticate, create);

// Get all API Keys (org scoped)
apiKeyRoute.get("/", authenticate, getAll);

// Update API Key
apiKeyRoute.patch("/:id", authenticate, update);

// Revoke API Key
apiKeyRoute.post("/:id/revoke", authenticate, revoke);

// Delete API Key
apiKeyRoute.delete("/:id", authenticate, deleteApiKey);


export default apiKeyRoute;