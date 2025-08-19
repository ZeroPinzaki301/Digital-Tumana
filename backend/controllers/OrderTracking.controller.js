import OrderTracking from "../models/OrderTracking.model.js";
import Order from "../models/Order.model.js";
import Seller from "../models/Seller.model.js";

export const createOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Verify the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Create with retry logic for potential duplicates
    let attempts = 0;
    const maxAttempts = 3;
    let orderTracking;

    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        orderTracking = new OrderTracking({
          orderId,
          paymentStatus: "Pending"
        });

        await orderTracking.save();
        break; // Success, exit loop
      } catch (err) {
        if (err.code === 11000 && attempts < maxAttempts) {
          // Duplicate key error, try again
          continue;
        }
        throw err; // Re-throw other errors
      }
    }

    res.status(201).json({
      success: true,
      message: "Order tracking created",
      orderTracking
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create order tracking",
      error: err.message
    });
  }
};

// Get order tracking by order ID
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderTracking = await OrderTracking.findOne({ orderId })
      .populate('orderId');

    if (!orderTracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found for this order"
      });
    }

    const orderStatus = orderTracking.orderId?.status;

    if (!["confirmed", "shipped", "cancelled"].includes(orderStatus)) {
      return res.status(403).json({
        success: false,
        message: "Tracking info not available for this order status"
      });
    }

    res.status(200).json({
      success: true,
      orderTracking,
      orderStatus
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order tracking",
      error: err.message
    });
  }
};

export const getAllOngoingOrders = async (req, res) => {
  try {
    const ongoingStatuses = ["confirmed", "shipped", "out for delivery"];

    const ongoingTrackings = await OrderTracking.find()
      .populate({
        path: "orderId",
        match: { status: { $in: ongoingStatuses } },
      });

    // Filter out any tracking records where the order didn't match status
    const filteredTrackings = ongoingTrackings.filter(
      tracking => tracking.orderId !== null
    );

    res.status(200).json({
      success: true,
      ongoingOrders: filteredTrackings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ongoing orders",
      error: err.message
    });
  }
};

export const getSellerOngoingOrders = async (req, res) => {
  try {
    const sellerUserId = req.user._id;
    const ongoingStatuses = ["confirmed", "shipped", "out for delivery"];

    const seller = await Seller.findOne({ userId: sellerUserId });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const sellerTrackings = await OrderTracking.find()
      .populate({
        path: 'orderId',
        match: {
          sellerId: seller._id,
          status: { $in: ongoingStatuses }
        }
      })
      .lean();

    const filteredTrackings = sellerTrackings
      .filter(tracking => tracking.orderId)
      .map(tracking => ({
        ...tracking,
        status: tracking.orderId.status,
        orderId: tracking.orderId._id // Flatten the orderId to just the ID
      }));

    res.status(200).json({
      success: true,
      ongoingOrders: filteredTrackings
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller ongoing orders",
      error: err.message
    });
  }
};