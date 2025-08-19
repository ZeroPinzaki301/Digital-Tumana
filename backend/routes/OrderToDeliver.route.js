import express from 'express';
import {
  assignRiderToOrder,
  getDeliveryAssignment,
  getUndeliveredOrders,
  getDeliveredOrders,
  getTrackingDetails,
  getDeliveredDetails,
  markOrderAsCompleted
} from '../controllers/OrderToDeliver.controller.js';

import { protectSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Delivered view
router.get('/delivered', getDeliveredOrders);

// ✅ Undelivered view
router.get('/undelivered', getUndeliveredOrders);

// ✅ Admin viewing full delivery detail (new route)
router.get('/delivered/details/:deliveryId', getDeliveredDetails);

router.put('/mark-completed/:deliveryId', protectSuperAdmin, markOrderAsCompleted);

// ✅ Assign rider
router.post('/:orderId/assign-rider', assignRiderToOrder);

// ✅ Fetch delivery assignment dynamically by either _id or orderId
router.get('/:orderId', getDeliveryAssignment);

// ✅ Tracking from frontend with delivery progress
router.get('/tracking/:orderId', getTrackingDetails);

export default router;