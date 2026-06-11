import { Router } from "express";


import 
dashboard
 from "../controllers/dashboard.controller.ts";

import { authenticate } from "../../middleware/authentication.middleware.ts";

const dashBoardRoutes = Router();

dashBoardRoutes.use(authenticate);

dashBoardRoutes.get("/summary", dashboard.summary);

dashBoardRoutes.get("/recent-urls", dashboard.recentUrls);

dashBoardRoutes.get("/top-urls", dashboard.topUrls);

export default dashBoardRoutes;