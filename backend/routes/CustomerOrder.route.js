import express from 'express';
import { getCustomerOngoingOrders, getCustomerOrderHistory } from '../controllers/CustomerOrder.controller.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/ongoing', protect, getCustomerOngoingOrders);
router.get('/history', protect, getCustomerOrderHistory); // 👈 New route

export default router;