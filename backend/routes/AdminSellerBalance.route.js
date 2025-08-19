import express from 'express';
import {
  getAllPendingPaymentOrders,
  getPendingPaymentOrderDetails,
  updateSellerBalanceAfterDelivery,
  getAllSellerBalances,
  getSellerWithdrawalsBySellerId,
  approveSellerWithdrawal
} from '../controllers/AdminSellerBalance.controller.js';

import protectSuperAdmin from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/pending-payment', protectSuperAdmin, getAllPendingPaymentOrders);
router.get('/pending-payment/:orderId', protectSuperAdmin, getPendingPaymentOrderDetails);
router.patch('/update', protectSuperAdmin, updateSellerBalanceAfterDelivery);
router.get('/', protectSuperAdmin, getAllSellerBalances);
router.get('/withdrawal/:sellerId', protectSuperAdmin, getSellerWithdrawalsBySellerId);
router.put('/withdrawal/:withdrawalId/status', protectSuperAdmin, approveSellerWithdrawal);


export default router;