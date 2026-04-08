// middleware/globalRateLimiter.ts
import rateLimit from "express-rate-limit";
import { HTTP_STATUS, MESSAGES } from "../constants/index.ts";

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000, // high limit (system-wide)
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: "Too many requests (global limit)",
    });
  },
});