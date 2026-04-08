import { Router } from "express";
import authController from "../controllers/auth.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me",authenticate, authController.me);

export default router;