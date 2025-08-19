import OrderTracking from "../models/OrderTracking.model.js";
import Order from "../models/Order.model.js";

export const getAdminConfirmedOrders = async (req, res) => {
  try {
    // First get all OrderTracking records
    const orderTrackings = await OrderTracking.find()
      .populate({
        path: 'orderId',
        match: { status: 'confirmed' },  // This filters the populated orders
        populate: [
          { 
            path: 'buyerId', 
            select: 'fullName email' 
          },
          { 
            path: 'sellerId', 
            select: 'storeName storePicture' 
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out trackings where orderId is null (didn't match the status)
    const confirmedOrders = orderTrackings.filter(tracking => tracking.orderId !== null);

    res.status(200).json({
      success: true,
      orders: confirmedOrders
    });

  } catch (err) {
    console.error('Error in getAdminConfirmedOrders:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confirmed orders",
      error: err.message
    });
  }
};

export const getAdminConfirmedOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      status: 'confirmed'
    })
    .populate({
      path: 'buyerId',
      select: 'fullName email telephone',
      model: 'Customer'
    })
    .populate({
      path: 'sellerId',
      select: 'storeName storePicture firstName lastName email',
      model: 'Seller'
    })
    .populate({
      path: 'items.productId',
      select: 'productName pricePerUnit unitType productImage',
      model: 'Product'
    })
    .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Confirmed order not found"
      });
    }

    // Get tracking info if exists
    const tracking = await OrderTracking.findOne({ orderId: order._id });

    // Transform the data to match frontend expectations
    const transformedOrder = {
      ...order,
      orderCode: tracking?.orderCode || order.orderCode, // Use tracking orderCode if available
      buyerId: {
        firstName: order.buyerId?.fullName?.split(' ')[0] || '',
        lastName: order.buyerId?.fullName?.split(' ').slice(1).join(' ') || '',
        email: order.buyerId?.email,
        telephone: order.buyerId?.telephone
      },
      items: order.items.map(item => ({
        ...item,
        productId: {
          name: item.productId?.productName,
          price: item.productId?.pricePerUnit,
          images: [item.productId?.productImage], // Wrap in array to match frontend expectation
          unitType: item.productId?.unitType
        }
      })),
      tracking
    };

    res.status(200).json({
      success: true,
      order: transformedOrder
    });
  } catch (err) {
    console.error('Error in getAdminConfirmedOrderDetail:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confirmed order details",
      error: err.message
    });
  }
};

// Update confirmed order status
export const updateAdminConfirmedOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['shipped', 'cancelled']; // Can only transition to these from confirmed

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status transition from confirmed"
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        status: 'confirmed' // Only update if currently confirmed
      },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Confirmed order not found or already updated"
      });
    }

    // Create/update tracking record if shipped
    if (status === 'shipped') {
      await OrderTracking.findOneAndUpdate(
        { orderId: order._id },
        { 
          shippingDate: new Date(),
          status: 'shipped'
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (err) {
    console.error('Error in updateAdminConfirmedOrderStatus:', err);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: err.message
    });
  }
};

export const getAdminShippedOrders = async (req, res) => {
  try {
    // Fetch all OrderTracking records
    const orderTrackings = await OrderTracking.find()
      .populate({
        path: 'orderId',
        match: { status: 'shipped' },  // Filter orders with 'shipped' status
        populate: [
          {
            path: 'buyerId',
            select: 'fullName email'
          },
          {
            path: 'sellerId',
            select: 'storeName storePicture'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out entries with no matching orderId
    const shippedOrders = orderTrackings.filter(tracking => tracking.orderId !== null);

    res.status(200).json({
      success: true,
      orders: shippedOrders
    });
  } catch (err) {
    console.error('Error in getAdminShippedOrders:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipped orders",
      error: err.message
    });
  }
};

export const getAdminShippedOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      status: 'shipped'
    })
    .populate({
      path: 'buyerId',
      select: 'fullName email telephone',
      model: 'Customer'
    })
    .populate({
      path: 'sellerId',
      select: 'storeName storePicture firstName lastName email',
      model: 'Seller'
    })
    .populate({
      path: 'items.productId',
      select: 'productName pricePerUnit unitType productImage',
      model: 'Product'
    })
    .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Confirmed order not found"
      });
    }

    // Get tracking info if exists
    const tracking = await OrderTracking.findOne({ orderId: order._id });

    // Transform the data to match frontend expectations
    const transformedOrder = {
      ...order,
      orderCode: tracking?.orderCode || order.orderCode, // Use tracking orderCode if available
      buyerId: {
        firstName: order.buyerId?.fullName?.split(' ')[0] || '',
        lastName: order.buyerId?.fullName?.split(' ').slice(1).join(' ') || '',
        email: order.buyerId?.email,
        telephone: order.buyerId?.telephone
      },
      items: order.items.map(item => ({
        ...item,
        productId: {
          name: item.productId?.productName,
          price: item.productId?.pricePerUnit,
          images: [item.productId?.productImage], // Wrap in array to match frontend expectation
          unitType: item.productId?.unitType
        }
      })),
      tracking
    };

    res.status(200).json({
      success: true,
      order: transformedOrder
    });
  } catch (err) {
    console.error('Error in getAdminConfirmedOrderDetail:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch confirmed order details",
      error: err.message
    });
  }
};