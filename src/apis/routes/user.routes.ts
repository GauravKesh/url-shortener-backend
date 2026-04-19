
import { Router } from "express";


import { authenticate } from "../../middleware/authentication.middleware.ts";
import userController from "../controllers/user.controller.ts";

const userRoute = Router();
userRoute.use(authenticate);


userRoute.get("/me", userController.me);
userRoute.patch("/me", userController.updateProfile);
userRoute.post("/change-password", userController.changePassword);
userRoute.delete("/me", userController.deleteAccount);

export default userRoute;