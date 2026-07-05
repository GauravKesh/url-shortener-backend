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
apiKeyRoute.patch("/:apiKeyId", update);

// Revoke API Key
apiKeyRoute.post("/:apiKeyId/revoke", revoke);

// Delete API Key
apiKeyRoute.delete("/:apiKeyId", deleteApiKey);


export default apiKeyRoute;