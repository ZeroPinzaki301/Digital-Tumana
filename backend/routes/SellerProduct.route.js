import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import {
  createProduct,
  getSellerProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/SellerProduct.controller.js";

const router = express.Router();

router.post(
  "/seller",
  protect,
  upload.fields([
    { name: "productImage", maxCount: 1 },
    { name: "extraImages", maxCount: 5 }
  ]),
  createProduct
);

router.get("/seller", protect, getSellerProducts);
router.get("/seller/:productId", protect, getSingleProduct);
router.put("/seller/:productId", protect, updateProduct);
router.delete("/seller/:productId", protect, deleteProduct);

export default router;