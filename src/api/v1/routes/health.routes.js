import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Servicio disponible",
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "v1"
    }
  });
});

export default router;
