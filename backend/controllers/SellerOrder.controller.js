import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Seller from "../models/Seller.model.js";

export const getPendingOrdersForSeller = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || seller.status !== "verified") {
      return res.status(403).json({ message: "Seller not verified" });
    }

    const orders = await Order.find({ 
      sellerId: seller._id,
      "items.itemStatus": "pending"
    })
    .populate("buyerId")
    .populate("items.productId");

    const filteredOrders = orders.map(order => {
      const pendingItems = order.items.filter(item => item.itemStatus === "pending");
      return {
        ...order.toObject(),
        items: pendingItems
      };
    }).filter(order => order.items.length > 0);

    res.status(200).json({ orders: filteredOrders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending orders", error: err.message });
  }
};

export const getSingleOrderSummary = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("buyerId")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

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

export const acceptOrderRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const pendingItems = order.items.filter(item => item.itemStatus === "pending");
    if (pendingItems.length === 0) {
      return res.status(400).json({ message: "No pending items in this order" });
    }

    // Process each pending item
    let atLeastOneConfirmed = false;
    for (const item of pendingItems) {
      const product = item.productId;
      
      if (!product || product.stock < item.quantity) {
        continue;
      }

      product.stock -= item.quantity;
      await product.save();

      item.itemStatus = "confirmed";
      atLeastOneConfirmed = true;
    }

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

export const cancelOrderRequest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const cancellableItems = order.items.filter(item => 
      item.itemStatus === "pending" || item.itemStatus === "confirmed"
    );
    
    if (cancellableItems.length === 0) {
      return res.status(400).json({ message: "No cancellable items in this order" });
    }

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

    const allCancelled = order.items.every(item => 
      item.itemStatus === "cancelled" || item.itemStatus === "completed"
    );

    if (allCancelled) {
      order.status = "cancelled";
    } else {
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

export const getOrderHistory = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || seller.status !== "verified") {
      return res.status(403).json({ message: "Seller not verified" });
    }

    const orders = await Order.find({
      sellerId: seller._id,
      status: { $in: ["completed", "cancelled"] }
    })
    .populate({
      path: "buyerId",
      populate: {
        path: "userId",
        model: "User"
      }
    })
    .populate("items.productId");

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order history", error: err.message });
  }
};
