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

    // Find orders where at least one item is pending and seller matches
    const orders = await Order.find({ 
      sellerId: seller._id,
      "items.itemStatus": "pending"
    })
    .populate("buyerId")
    .populate("items.productId");

    // Filter to only include pending items in the response
    const filteredOrders = orders.map(order => {
      const pendingItems = order.items.filter(item => item.itemStatus === "pending");
      return {
        ...order.toObject(),
        items: pendingItems
      };
    }).filter(order => order.items.length > 0); // Only return orders with pending items

    res.status(200).json({ orders: filteredOrders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending orders", error: err.message });
  }
};

// 📖 View details of a single pending order
export const getSingleOrderSummary = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("buyerId")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Filter to only show pending items (or all items if needed)
    const pendingItems = order.items.filter(item => item.itemStatus === "pending");
    
    if (pendingItems.length === 0) {
      return res.status(404).json({ message: "No pending items in this order" });
    }

    const orderSummary = {
      ...order.toObject(),
      items: pendingItems
    };

    res.status(200).json({ order: orderSummary });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve order summary", error: err.message });
  }
};

// ✅ Accept an order request (deduct stock) - UPDATED FOR ITEMS ARRAY
export const acceptOrderRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if any items are still pending
    const pendingItems = order.items.filter(item => item.itemStatus === "pending");
    if (pendingItems.length === 0) {
      return res.status(400).json({ message: "No pending items in this order" });
    }

    // Process each pending item
    let atLeastOneConfirmed = false;
    for (const item of pendingItems) {
      const product = item.productId;
      
      if (!product || product.stock < item.quantity) {
        continue; // Skip this item but try others
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      // Update item status
      item.itemStatus = "confirmed";
      atLeastOneConfirmed = true;
    }

    // Update order status if at least one item was confirmed
    if (atLeastOneConfirmed) {
      order.status = "confirmed";
    } else {
      return res.status(400).json({ 
        message: "Could not confirm any items due to insufficient stock",
        outOfStockItems: pendingItems.map(item => ({
          productId: item.productId._id,
          productName: item.productId.productName,
          requestedQuantity: item.quantity,
          availableStock: item.productId.stock
        }))
      });
    }

    await order.save();

    res.status(200).json({ 
      message: "Order items processed", 
      order: await Order.findById(order._id)
        .populate('buyerId')
        .populate('items.productId'),
      confirmedItems: order.items.filter(item => item.itemStatus === "confirmed"),
      remainingPendingItems: order.items.filter(item => item.itemStatus === "pending")
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept order", error: err.message });
  }
};

// ❌ Cancel a pending order request - UPDATED FOR ITEMS ARRAY
export const cancelOrderRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if any items are still pending or confirmed
    const cancellableItems = order.items.filter(item => 
      item.itemStatus === "pending" || item.itemStatus === "confirmed"
    );
    
    if (cancellableItems.length === 0) {
      return res.status(400).json({ message: "No cancellable items in this order" });
    }

    // Mark items as cancelled (only for this seller's products)
    const seller = await Seller.findOne({ userId: req.user._id });
    let itemsCancelled = 0;
    
    for (const item of cancellableItems) {
      const product = await Product.findById(item.productId);
      if (product && product.sellerId.equals(seller._id)) {
        item.itemStatus = "cancelled";
        itemsCancelled++;
      }
    }

    if (itemsCancelled === 0) {
      return res.status(400).json({ message: "No items belong to this seller to cancel" });
    }

    // Check if all items are now cancelled
    const allCancelled = order.items.every(item => 
      item.itemStatus === "cancelled" || item.itemStatus === "completed"
    );

    // Update order status if all items are cancelled
    if (allCancelled) {
      order.status = "cancelled";
    } else {
      // Keep order as confirmed if at least one item is still confirmed
      order.status = "confirmed";
    }

    await order.save();

    res.status(200).json({ 
      message: "Items cancelled successfully",
      order: await Order.findById(order._id)
        .populate('buyerId')
        .populate('items.productId'),
      cancelledItems: order.items.filter(item => item.itemStatus === "cancelled"),
      remainingItems: order.items.filter(item => 
        item.itemStatus !== "cancelled" && item.itemStatus !== "completed"
      )
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
};