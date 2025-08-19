import express from "express";
import {
  getAdminConfirmedOrders,
  getAdminConfirmedOrderDetail,
  updateAdminConfirmedOrderStatus,
  getAdminShippedOrders,
  getAdminShippedOrderDetail
} from "../controllers/AdminOrderTracking.controller.js";
import protectSuperAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/confirmed", protectSuperAdmin, getAdminConfirmedOrders);

router.get("/shipped", protectSuperAdmin, getAdminShippedOrders);

router.get('/orders/:orderId', protectSuperAdmin, getAdminConfirmedOrderDetail);

router.get('/shipped-orders/:orderId', protectSuperAdmin, getAdminShippedOrderDetail);

router.put('/orders/:orderId/status', protectSuperAdmin, updateAdminConfirmedOrderStatus);



export default router;