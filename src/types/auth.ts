import { Request } from "express";
import { AuthUser } from "./express.js";

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}