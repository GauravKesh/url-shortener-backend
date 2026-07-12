import { Router } from "express";
import authController from "../controllers/auth.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const AuthRouter = Router();

AuthRouter.post("/signup", authController.signup);
AuthRouter.post("/login", authController.login);
AuthRouter.post("/request-password-reset", authController.requestPasswordReset);
AuthRouter.post("/reset-password", authController.resetPassword);


AuthRouter.post("/logout", authController.logout);
AuthRouter.post("/refresh", authController.refresh);

AuthRouter.use(authenticate)
AuthRouter.get("/me", authController.me);
AuthRouter.post("/signed/reset-password", authController.resetPassword);

export default AuthRouter;