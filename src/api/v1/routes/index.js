import { Router } from "express";

import healthRouter from "./health.routes.js";
import productRouter from "./product.routes.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "API v1 disponible",
    data: {
      version: "v1",
      endpoints: {
        health: "/api/v1/health",
        productos: "/api/v1/productos"
      }
    }
  });
});

router.use("/health", healthRouter);
router.use("/productos", productRouter);

export default router;
