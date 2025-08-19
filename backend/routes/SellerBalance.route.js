import express from 'express';
import {
  createSellerBalance,
  getSellerBalance,
  createSellerBalanceWithdrawal,
  getPendingSellerBalanceWithdrawal,
  getSellerBalanceWithdrawalHistory 
} from '../controllers/SellerBalance.controller.js';

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create balance for the logged-in seller
router.post('/create', protect, createSellerBalance);

// Get balance for the logged-in seller
router.get('/', protect, getSellerBalance);

// Create a withdrawal request for the logged-in seller
router.post('/withdraw', protect, createSellerBalanceWithdrawal);

// Get the pending balance withdrawal of the logged-in seller
router.get('/withdraw/pending', protect, getPendingSellerBalanceWithdrawal);

// Get withdrawal history (approved & rejected) for the logged-in seller
router.get('/withdraw/history', protect, getSellerBalanceWithdrawalHistory);

export default router;