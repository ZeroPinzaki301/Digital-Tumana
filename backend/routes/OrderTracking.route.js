import express from "express";
import { 
  createOrderTracking,
  getOrderTracking,
  getAllOngoingOrders,
  getSellerOngoingOrders
} from "../controllers/OrderTracking.controller.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrderTracking);

router.get("/:orderId", protect, getOrderTracking);

router.get("/seller/ongoing", protect, getSellerOngoingOrders);

export default router;