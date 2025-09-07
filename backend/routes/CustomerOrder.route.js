import express from 'express';
import { 
  getCustomerOngoingOrders, 
  getCustomerOrderHistory,
  getOngoingOrderDetails
 } from '../controllers/CustomerOrder.controller.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/ongoing', protect, getCustomerOngoingOrders);
router.get('/ongoing/:orderId', protect, getOngoingOrderDetails);
router.get('/history', protect, getCustomerOrderHistory);

export default router;