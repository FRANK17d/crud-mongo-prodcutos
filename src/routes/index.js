import { Router } from "express";

import apiV1Router from "../api/v1/routes/index.js";

const router = Router();

router.use("/v1", apiV1Router);

export default router;
