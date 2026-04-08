import { Router } from "express";
import {
  livenessCheck,
  readinessCheck,
  fullHealthCheck,
} from "../controllers/health.controller.ts";

const router = Router();

router.get("/", livenessCheck);          
router.get("/ready", readinessCheck);    

//  optional granular checks
router.get("/full", fullHealthCheck);    // /health/full

export default router;