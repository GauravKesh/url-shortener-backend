import { Router } from "express";
import authController from "../controllers/auth.controller.ts";
import { authenticate } from "../../middleware/authentication.middleware.ts";

const AuthRouter = Router();

AuthRouter.post("/signup", authController.signup);
AuthRouter.post("/login", authController.login);

AuthRouter.post("/logout", authController.logout);

AuthRouter.use(authenticate)
AuthRouter.get("/me", authController.me);
AuthRouter.post("/refresh", authController.refresh);
export default AuthRouter;