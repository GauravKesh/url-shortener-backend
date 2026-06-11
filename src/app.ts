import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";


import routers from "./apis/routes/index.ts";
import { globalErrorHandler } from "./middleware/globalErrorHandler.ts";
import { requestLogger } from "./middleware/requestLogger.middleware.ts";
import { requestIdMiddleware } from "./middleware/requestId.middleware.ts";
import { apiRateLimiter } from "./middleware/apiRateLimiter.middleware.ts";
import { globalRateLimiter } from "./middleware/globalRateLimiter.middleware.ts";
import config from "./config/config.ts";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// CORE MIDDLEWARE

// 🔹 CORS
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        config.app.frontendUrl,
        config.app.adminUrl, // optional
      ].filter(Boolean)
    : [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ];


const corsOptions = {
    origin: function (origin:any, callback:any) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // relaxed
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));

//  GLOBAL LIMITER FIRST (DDoS protection)
app.disable("x-powered-by");
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

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Shortify API</title>
      </head>
      <body style="font-family:sans-serif;text-align:center;padding-top:100px">
        <h1>🚀 Shortify API</h1>
        <p>This is the backend server.</p>
        <p>
          Visit the frontend:
          <a href="https://shortify.gkrcoder.me">
            shortify
          </a>
        </p>
      </body>
    </html>
  `);
});

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