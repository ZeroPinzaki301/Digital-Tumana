import OrderTracking from '../models/OrderTracking.model.js';
import OrderToDeliver from '../models/OrderToDeliver.model.js';
import SellerBalance from '../models/SellerBalance.model.js';
import SellerBalanceWithdrawal from '../models/SellerBalanceWithdrawal.model.js';
import Seller from '../models/Seller.model.js';


export const getAllPendingPaymentOrders = async (req, res) => {
  try {
    const pendingTrackings = await OrderTracking.find({ paymentStatus: "Pending" })
      .populate({
        path: "orderId",
        match: { status: "completed" }, // Only orders marked completed
        select: "totalPrice sellerId status" // Optional: just limit fields for clarity
      });

    const filtered = pendingTrackings.filter(track => track.orderId !== null);

    const results = filtered.map(track => ({
      trackingId: track._id,
      orderCode: track.orderCode,
      orderId: track.orderId._id,
      sellerId: track.orderId.sellerId,
      totalPrice: track.orderId.totalPrice,
      status: track.orderId.status,
      createdAt: track.createdAt
    }));

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('[Admin - Get Pending Payment Orders]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payment orders.',
      error: error.message
    });
  }
};

export const getPendingPaymentOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderToDeliver = await OrderToDeliver.findOne({ orderId })
      .populate({
        path: 'orderId',
        select: 'items sellerId totalPrice'
      })
      .populate({
        path: 'orderTrackingId',
        select: 'orderCode'
      })
      .populate({
        path: 'riderId',
        select: 'name contactInfo' // Adjust based on KaritonService schema
      });

    if (!orderToDeliver) {
      return res.status(404).json({ message: 'OrderToDeliver not found for this orderId' });
    }

    const response = {
      orderId: orderToDeliver.orderId._id,
      items: orderToDeliver.orderId.items,
      sellerId: orderToDeliver.orderId.sellerId,
      totalPrice: orderToDeliver.orderId.totalPrice,
      orderCode: orderToDeliver.orderTrackingId.orderCode,
      riderId: orderToDeliver.riderId,
      deliveryProof: orderToDeliver.deliveryProof
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching order to deliver details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSellerBalanceAfterDelivery = async (req, res) => {
  const { sellerId, totalPrice, orderCode } = req.body;

  // 🛡️ Enhanced validation
  if (
    !sellerId ||
    typeof totalPrice !== 'number' ||
    !orderCode ||
    typeof orderCode !== 'string' ||
    !orderCode.trim()
  ) {
    console.warn("Validation failed:", { sellerId, totalPrice, orderCode });
    return res.status(400).json({
      message: 'Missing or invalid sellerId, totalPrice, or orderCode'
    });
  }

  const amountToAdd = totalPrice - 50;

  try {
    // 🏦 Update seller balance
    const updatedBalance = await SellerBalance.findOneAndUpdate(
      { sellerId },
      { $inc: { currentBalance: amountToAdd } },
      { new: true }
    );

    if (!updatedBalance) {
      return res.status(404).json({ message: 'SellerBalance not found for this sellerId' });
    }

    // 💳 Attempt to update payment status in OrderTracking
    let updatedTracking = null;
    try {
      console.log("Attempting to update OrderTracking for orderCode:", orderCode);
      updatedTracking = await OrderTracking.findOneAndUpdate(
        { orderCode: orderCode.trim() },
        { paymentStatus: "Paid" },
        { new: true }
      );

      if (!updatedTracking) {
        console.warn("No OrderTracking found for orderCode:", orderCode);
      }
    } catch (trackingError) {
      console.error("Error updating OrderTracking:", trackingError);
    }

    res.status(200).json({
      message: 'Seller balance updated successfully',
      updatedBalance,
      paymentStatusUpdated: !!updatedTracking,
      updatedTracking
    });
  } catch (error) {
    console.error('Error updating seller balance or payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllSellerBalances = async (req, res) => {
  try {
    const balances = await SellerBalance.find().populate({
      path: 'sellerId',
      select: 'firstName lastName email userId' // Adjust fields based on your Seller schema
    });

    return res.status(200).json({
      message: 'All seller balances fetched successfully.',
      data: balances
    });
  } catch (error) {
    console.error('Error fetching all seller balances:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getSellerWithdrawalsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const sellerExists = await Seller.exists({ _id: sellerId });
    if (!sellerExists) {
      return res.status(404).json({ message: 'Seller not found.' });
    }

    // Only fetch withdrawals with 'pending' status
    const withdrawals = await SellerBalanceWithdrawal.find({ 
      sellerId, 
      status: 'pending' // Add this filter
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Withdrawals fetched successfully.',
      data: withdrawals
    });
  } catch (error) {
    console.error('[Admin - Get Seller Withdrawals]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const approveSellerWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    // Find the withdrawal request
    const withdrawal = await SellerBalanceWithdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found.' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending.' });
    }

    // Find the seller's balance
    const sellerBalance = await SellerBalance.findOne({ sellerId: withdrawal.sellerId });
    if (!sellerBalance) {
      return res.status(404).json({ message: 'Seller balance not found.' });
    }

    if (sellerBalance.currentBalance < withdrawal.withdrawalAmount) {
      return res.status(400).json({ message: 'Insufficient balance for withdrawal.' });
    }

    // Update balance and withdrawal status
    sellerBalance.currentBalance -= withdrawal.withdrawalAmount;
    withdrawal.status = 'approved';

    await Promise.all([
      sellerBalance.save(),
      withdrawal.save()
    ]);

    return res.status(200).json({ message: 'Withdrawal approved and balance updated.' });
  } catch (error) {
    console.error('[Approve Withdrawal]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
