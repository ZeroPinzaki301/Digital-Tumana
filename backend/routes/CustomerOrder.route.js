import express from 'express';
import { 
  getCustomerOngoingOrders, 
  getCustomerOrderHistory,
  getOngoingOrderDetails,
  getOrderHistoryDetails
 } from '../controllers/CustomerOrder.controller.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/ongoing', protect, getCustomerOngoingOrders);
router.get('/ongoing/:orderId', protect, getOngoingOrderDetails);
router.get('/history', protect, getCustomerOrderHistory);
router.get('/history/:orderId', protect, getOrderHistoryDetails);

export default router;