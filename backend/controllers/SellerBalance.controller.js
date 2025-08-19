import SellerBalance from '../models/SellerBalance.model.js';
import Seller from '../models/Seller.model.js';
import SellerBalanceWithdrawal from '../models/SellerBalanceWithdrawal.model.js';

const generateUniqueBankNumber = async () => {
  let bankNumber;
  let exists = true;

  while (exists) {
    const letters = Array.from({ length: 4 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const numbers = Math.floor(1000 + Math.random() * 9000);
    bankNumber = `${letters}${numbers}`;

    exists = await SellerBalance.exists({ bankNumber });
  }

  return bankNumber;
};

export const createSellerBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    const seller = await Seller.findOne({ userId });

    if (!seller) {
      return res.status(404).json({ message: 'Seller profile not found.' });
    }

    const bankNumber = await generateUniqueBankNumber();


    const newBalance = new SellerBalance({
      sellerId: seller._id,
      currentBalance: 0,
      bankNumber
    });

    await newBalance.save();

    return res.status(201).json({
      message: 'Seller balance created successfully.',
      data: newBalance
    });
  } catch (error) {
    console.error('Error creating seller balance:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getSellerBalance = async (req, res) => {
  try {
    const userId = req.user._id; 

    const seller = await Seller.findOne({ userId });

    if (!seller) {
      return res.status(404).json({ message: 'Seller profile not found.' });
    }

    const balance = await SellerBalance.findOne({ sellerId: seller._id });

    if (!balance) {
      return res.status(404).json({ message: 'Balance record not found for this seller.' });
    }

    return res.status(200).json({ message: 'Balance fetched successfully.', data: balance });
  } catch (error) {
    console.error('Error fetching seller balance:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createSellerBalanceWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { withdrawalAmount } = req.body;

    const seller = await Seller.findOne({ userId });
    if (!seller) {
      return res.status(404).json({ message: 'Seller profile not found.' });
    }

    const balance = await SellerBalance.findOne({ sellerId: seller._id });
    if (!balance) {
      return res.status(404).json({ message: 'Balance record not found.' });
    }

    if (withdrawalAmount > balance.currentBalance) {
      return res.status(400).json({ message: 'Insufficient balance for withdrawal.' });
    }

    const withdrawal = new SellerBalanceWithdrawal({
      sellerId: seller._id,
      bankNumber: balance.bankNumber,
      withdrawalAmount,
      status: 'pending'
    });

    await withdrawal.save();

    return res.status(201).json({
      message: 'Withdrawal request submitted successfully.',
      data: withdrawal
    });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getPendingSellerBalanceWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;

    const seller = await Seller.findOne({ userId });
    if (!seller) {
      return res.status(404).json({ message: 'Seller profile not found.' });
    }

    const pendingWithdrawal = await SellerBalanceWithdrawal.findOne({
      sellerId: seller._id,
      status: 'pending'
    });

    if (!pendingWithdrawal) {
      return res.status(200).json({ message: 'No pending withdrawal found.', data: null });
    }

    return res.status(200).json({
      message: 'Pending withdrawal fetched successfully.',
      data: pendingWithdrawal
    });
  } catch (error) {
    console.error('Error fetching pending withdrawal:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getSellerBalanceWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const seller = await Seller.findOne({ userId });
    if (!seller) {
      return res.status(404).json({ message: 'Seller profile not found.' });
    }

    const historyStatuses = ['approved', 'rejected'];

    const withdrawals = await SellerBalanceWithdrawal.find({
      sellerId: seller._id,
      status: { $in: historyStatuses }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Withdrawal history fetched successfully.',
      data: withdrawals
    });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

