import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Seller from "../models/Seller.model.js";
import OrderToDeliver from "../models/OrderToDeliver.model.js";

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

    // Get all completed and cancelled orders
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

    // Get only completed order IDs
    const completedOrderIds = orders
      .filter(order => order.status === "completed")
      .map(order => order._id);

    // Get delivery data for completed orders in a single query
    const deliveryData = await OrderToDeliver.find({
      orderId: { $in: completedOrderIds }
    }).populate({
      path: "riderId",
      select: "firstName lastName email telephone profilePicture"
    });

    // Create a map for quick lookup
    const deliveryMap = {};
    deliveryData.forEach(delivery => {
      deliveryMap[delivery.orderId.toString()] = {
        isDelivered: delivery.isDelivered,
        deliveryProof: delivery.deliveryProof,
        rider: delivery.riderId
      };
    });

    // Add delivery info to completed orders
    const ordersWithDelivery = orders.map(order => {
      const orderObj = order.toObject();
      if (order.status === "completed" && deliveryMap[order._id.toString()]) {
        orderObj.deliveryInfo = deliveryMap[order._id.toString()];
      }
      return orderObj;
    });

    res.status(200).json({ orders: ordersWithDelivery });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order history", error: err.message });
  }
};

export const getSalesAnalytics = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || seller.status !== "verified") {
      return res.status(403).json({ message: "Seller not verified" });
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          status: "completed",
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const topProducts = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          status: "completed",
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtOrder"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);

    const overallStats = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          status: "completed",
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalPrice" }
        }
      }
    ]);

    res.status(200).json({
      monthlySales,
      topProducts,
      overallStats: overallStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
};
