import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Seller from "../models/Seller.model.js";
import Customer from "../models/Customer.model.js";

// 📋 Get all pending orders for seller
export const getPendingOrdersForSeller = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || seller.status !== "verified") {
      return res.status(403).json({ message: "Seller not verified" });
    }

    const orders = await Order.find({ sellerId: seller._id, status: "pending" })
      .populate("productId")
      .populate("buyerId");

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending orders", error: err.message });
  }
};

// 📖 View details of a single pending order
export const getSingleOrderSummary = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("productId")
      .populate("buyerId");

    if (!order || order.status !== "pending") {
      return res.status(404).json({ message: "Pending order not found" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve order summary", error: err.message });
  }
};

// ✅ Accept an order request (deduct stock)
export const acceptOrderRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.status !== "pending") {
      return res.status(404).json({ message: "Pending order not found" });
    }

    const product = await Product.findById(order.productId);
    if (!product || product.stock < order.quantity) {
      return res.status(400).json({ message: "Insufficient stock to accept order" });
    }

    product.stock -= order.quantity;
    await product.save();

    order.status = "confirmed";
    await order.save();

    res.status(200).json({ message: "Order accepted", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept order", error: err.message });
  }
};

// ❌ Cancel a pending order request
export const cancelOrderRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.status !== "pending") {
      return res.status(404).json({ message: "Pending order not found" });
    }

    await Order.findByIdAndDelete(order._id);
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
};