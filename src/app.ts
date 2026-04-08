import express from "express";
import cookieParser from "cookie-parser";

import routers from "./apis/routes/index.ts";
import { globalErrorHandler } from "./middleware/globalErrorHandler.ts";
import { requestLogger } from "./middleware/requestLogger.middleware.ts";
import { requestIdMiddleware } from "./middleware/requestId.middleware.ts";
import { apiRateLimiter } from "./middleware/apiRateLimiter.middleware.ts";
import { globalRateLimiter } from "./middleware/globalRateLimiter.middleware.ts";

const app = express();


// CORE MIDDLEWARE

//  GLOBAL LIMITER FIRST (DDoS protection)
app.use(globalRateLimiter);

// requestId FIRST (used everywhere)
app.use(requestIdMiddleware);

//  parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  cookies
app.use(cookieParser());

//  logging (after requestId so it logs requestId)
app.use(requestLogger);


// ROUTES

app.use("/api/v1", routers);


// 404 HANDLER (important)

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    requestId: req.requestId,
    message: "Route not found"
  });
});


// GLOBAL ERROR HANDLER (LAST)

app.use(globalErrorHandler);

export default app;