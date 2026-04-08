import { Router } from "express";

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/product.controller.js";
import { validateObjectId } from "../../../middlewares/validate-object-id.js";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.get("/:id", validateObjectId, getProductById);
router.put("/:id", validateObjectId, updateProduct);
router.delete("/:id", validateObjectId, deleteProduct);

export default router;
