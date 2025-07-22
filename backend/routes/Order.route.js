import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  previewOrder,
  previewCartOrder,
  createDirectOrder,
  checkoutCart
} from "../controllers/Order.controller.js";

import {
  getPendingOrdersForSeller,
  getSingleOrderSummary,
  acceptOrderRequest,
  cancelOrderRequest
} from "../controllers/SellerOrder.controller.js";

const router = express.Router();

// 🔍 Customer-side order preview
router.get("/preview/product/:productId", protect, previewOrder);
router.get("/preview/cart", protect, previewCartOrder);

// 🧾 Customer-side checkout actions
router.post("/direct", protect, createDirectOrder);
router.post("/checkout", protect, checkoutCart);

// 🛒 Seller-side order review
router.get("/seller/pending", protect, getPendingOrdersForSeller);
router.get("/seller/summary/:orderId", protect, getSingleOrderSummary);
router.patch("/seller/accept/:orderId", protect, acceptOrderRequest);
router.delete("/seller/cancel/:orderId", protect, cancelOrderRequest);

export default router;