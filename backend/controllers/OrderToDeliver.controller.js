import OrderToDeliver from '../models/OrderToDeliver.model.js';
import Order from '../models/Order.model.js';
import OrderTracking from '../models/OrderTracking.model.js';
import KaritonService from '../models/KaritonService.model.js';

export const assignRiderToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    // Validate rider exists
    const rider = await KaritonService.findById(riderId);
    if (!rider) {
      return res.status(404).json({ 
        message: 'Rider not found' 
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is in a shippable state
    if (order.status !== 'shipped') {
      return res.status(400).json({ 
        message: `Order must be in 'shipped' status to assign rider` 
      });
    }

    // Find order tracking
    const orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      return res.status(404).json({ message: 'Order tracking not found' });
    }

    // Check for existing assignment
    const existingAssignment = await OrderToDeliver.findOne({ orderId });
    if (existingAssignment) {
      return res.status(400).json({ 
        message: 'This order is already assigned to a rider',
        existingAssignment
      });
    }

    // Create new delivery assignment
    const orderToDeliver = new OrderToDeliver({
      orderId,
      orderTrackingId: orderTracking._id,
      riderId,
      isDelivered: false
    });

    await orderToDeliver.save();

    // Update order status
    order.status = 'out for delivery';
    await order.save();

    res.status(201).json({
      message: 'Rider assigned successfully',
      orderToDeliver,
      riderDetails: {
        name: `${rider.firstName} ${rider.lastName}`,
        loginCode: rider.loginCode
      }
    });

  } catch (error) {
    console.error('Error assigning rider:', error);
    res.status(500).json({ 
      message: 'Failed to assign rider',
      error: error.message 
    });
  }
};

export const getDeliveryAssignment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const assignment = await OrderToDeliver.findOne({ orderId })
      .populate('riderId', 'firstName lastName profilePicture loginCode')
      .populate('orderTrackingId', 'orderCode paymentStatus');

    if (!assignment) {
      return res.status(404).json({ message: 'Delivery assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error fetching delivery assignment:', error);
    res.status(500).json({ 
      message: 'Failed to fetch delivery assignment',
      error: error.message 
    });
  }
};

// controllers/orderToDeliver.controller.js
export const getUndeliveredOrders = async (req, res) => {
  try {
    const undeliveredOrders = await OrderToDeliver.find({ isDelivered: false })
      .populate({
        path: 'orderTrackingId',
        select: 'orderCode'
      })
      .populate({
        path: 'riderId',
        select: 'firstName lastName'
      })
      .populate({
        path: 'orderId',
        select: '_id'
      })
      .lean();

    if (!undeliveredOrders || undeliveredOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No undelivered orders found',
        data: []
      });
    }

    const formattedOrders = undeliveredOrders.map(order => ({
      orderId: order.orderId?._id || null,
      orderCode: order.orderTrackingId?.orderCode || 'N/A',
      riderName: order.riderId ? 
        `${order.riderId.firstName} ${order.riderId.lastName}` : 
        'No rider assigned'
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching undelivered orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching undelivered orders',
      error: error.message 
    });
  }
};

export const getDeliveredOrders = async (req, res) => {
  try {
    const deliveredOrders = await OrderToDeliver.find({ isDelivered: true })
      .populate({
        path: 'orderId',
        select: 'status buyerId',
        populate: {
          path: 'buyerId',
          select: 'fullName'
        }
      })
      .populate('orderTrackingId', 'orderCode')
      .populate('riderId', 'firstName lastName email');

    // FIX: Changed 'out for Delivery' to 'out for delivery' (lowercase d)
    const filteredOrders = deliveredOrders.filter(order => 
      order.orderId?.status === 'out for delivery');

    const formatted = filteredOrders.map(order => ({
      _id: order._id,
      orderCode: order.orderTrackingId?.orderCode || '',
      buyerName: order.orderId?.buyerId?.fullName || 'Unknown',
      riderName: order.riderId
        ? `${order.riderId.firstName} ${order.riderId.lastName}`
        : 'Unassigned',
      deliveryProof: order.deliveryProof,
      deliveredAt: order.updatedAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('[Get Delivered Orders Error]', error);
    res.status(500).json({ error: 'Failed to fetch delivered orders.' });
  }
};

export const getTrackingDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get the delivery assignment
    const deliveryAssignment = await OrderToDeliver.findOne({ orderId })
      .populate({
        path: 'orderTrackingId',
        select: 'orderCode paymentStatus createdAt'
      })
      .populate({
        path: 'riderId',
        select: 'firstName lastName profilePicture telephone email'
      })
      .populate({
        path: 'orderId',
        populate: [
          {
            path: 'sellerId',
            select: 'firstName lastName'
          },
          {
            path: 'items.productId',
            select: 'name productImage' // Now including productImage
          }
        ]
      });

    if (!deliveryAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Delivery assignment not found'
      });
    }

    // Extract and format the data
    const trackingDetails = {
      isDelivered: deliveryAssignment.isDelivered,
      deliveryProof: deliveryAssignment.deliveryProof,
      assignedAt: deliveryAssignment.createdAt,

      // Order tracking info
      orderCode: deliveryAssignment.orderTrackingId.orderCode,
      paymentStatus: deliveryAssignment.orderTrackingId.paymentStatus,
      orderCreatedAt: deliveryAssignment.orderTrackingId.createdAt,

      // Rider info
      rider: {
        id: deliveryAssignment.riderId._id,
        name: `${deliveryAssignment.riderId.firstName} ${deliveryAssignment.riderId.lastName}`,
        profilePicture: deliveryAssignment.riderId.profilePicture,
        contact: {
          phone: deliveryAssignment.riderId.telephone,
          email: deliveryAssignment.riderId.email
        }
      },

      // Seller info
      seller: {
        name: `${deliveryAssignment.orderId.sellerId.firstName} ${deliveryAssignment.orderId.sellerId.lastName}`,
        address: {
          region: deliveryAssignment.orderId.sellerAddress.region,
          province: deliveryAssignment.orderId.sellerAddress.province,
          city: deliveryAssignment.orderId.sellerAddress.cityOrMunicipality,
          barangay: deliveryAssignment.orderId.sellerAddress.barangay,
          street: deliveryAssignment.orderId.sellerAddress.street,
          postalCode: deliveryAssignment.orderId.sellerAddress.postalCode,
          telephone: deliveryAssignment.orderId.sellerAddress.telephone,
          email: deliveryAssignment.orderId.sellerAddress.email
        },
        coordinates: {
          latitude: deliveryAssignment.orderId.sellerAddress.latitude,
          longitude: deliveryAssignment.orderId.sellerAddress.longitude
        }
      },

      // Delivery address
      deliveryAddress: {
        region: deliveryAssignment.orderId.deliveryAddress.region,
        province: deliveryAssignment.orderId.deliveryAddress.province,
        city: deliveryAssignment.orderId.deliveryAddress.cityOrMunicipality,
        barangay: deliveryAssignment.orderId.deliveryAddress.barangay,
        street: deliveryAssignment.orderId.deliveryAddress.street,
        postalCode: deliveryAssignment.orderId.deliveryAddress.postalCode,
        telephone: deliveryAssignment.orderId.deliveryAddress.telephone,
        email: deliveryAssignment.orderId.deliveryAddress.email
      },
      deliveryCoordinates: {
        latitude: deliveryAssignment.orderId.deliveryAddress.latitude,
        longitude: deliveryAssignment.orderId.deliveryAddress.longitude
      },

      // Order items - now with productImage
      items: deliveryAssignment.orderId.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.productImage, // Using productImage from Product model
        quantity: item.quantity,
        price: item.priceAtOrder,
        status: item.itemStatus
      })),

      // Order summary
      totalPrice: deliveryAssignment.orderId.totalPrice,
      orderStatus: deliveryAssignment.orderId.status
    };

    res.status(200).json({
      success: true,
      data: trackingDetails
    });

  } catch (error) {
    console.error('Error fetching tracking details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking details',
      error: error.message
    });
  }
};

export const getDeliveredDetails = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivered = await OrderToDeliver.findById(deliveryId)
      .populate({
        path: 'riderId',
        select: 'firstName lastName profilePicture telephone email'
      })
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.productId',
          select: 'name productImage price'
        }
      })
      .populate({
        path: 'orderTrackingId',
        select: 'orderCode'
      });

    if (!delivered || !delivered.isDelivered) {
      return res.status(404).json({
        success: false,
        message: 'Delivered record not found or not marked as delivered'
      });
    }

    const deliveryDetails = {
      orderId: delivered.orderId._id,
      orderCode: delivered.orderTrackingId?.orderCode || '',
      deliveredAt: delivered.updatedAt,
      deliveryProof: delivered.deliveryProof,

      rider: {
        id: delivered.riderId._id,
        name: `${delivered.riderId.firstName} ${delivered.riderId.lastName}`,
        profilePicture: delivered.riderId.profilePicture,
        contact: {
          phone: delivered.riderId.telephone,
          email: delivered.riderId.email
        }
      },

      deliveryAddress: delivered.orderId?.deliveryAddress ?? {},
      coordinates: {
        latitude: delivered.orderId?.deliveryAddress?.latitude,
        longitude: delivered.orderId?.deliveryAddress?.longitude
      },

      items: delivered.orderId.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.productImage,
        quantity: item.quantity,
        price: item.priceAtOrder,
        itemStatus: item.itemStatus
      })),

      orderSummary: {
        totalPrice: delivered.orderId.totalPrice,
        orderStatus: delivered.orderId.status
      }
    };

    res.status(200).json({
      success: true,
      data: deliveryDetails
    });

  } catch (error) {
    console.error('Error fetching delivered details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivered order details',
      error: error.message
    });
  }
};

export const markOrderAsCompleted = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivered = await OrderToDeliver.findById(deliveryId)
      .populate('orderId');

    if (!delivered || !delivered.isDelivered) {
      return res.status(404).json({ success: false, message: 'Delivery not found or not marked as delivered' });
    }

    delivered.orderId.status = 'completed';
    await delivered.orderId.save();

    res.status(200).json({ success: true, message: 'Order marked as completed' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};