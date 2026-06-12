import { Router } from "express";
import { createCustomUrl } from "../controllers/devApiKey.controller.ts";
import { apiKeyMiddleware } from "../../middleware/apiKey.middleware.ts";

const devApiRoute = Router();

/**
 * Public Endpoint for External Developers
 * Expects header: X-API-Key: your_raw_api_key
 */
devApiRoute.post("/custom/create", apiKeyMiddleware, createCustomUrl);

export default devApiRoute;