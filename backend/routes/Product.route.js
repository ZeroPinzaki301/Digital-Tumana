import express from "express";
import {
  getAvailableProducts,
  getProductDetails
} from "../controllers/Product.controller.js";

const router = express.Router();

// 📦 Get all available products
router.get("/", getAvailableProducts);

// 🔍 Get specific product by ID (if active)
router.get("/:productId", getProductDetails);

export default router;