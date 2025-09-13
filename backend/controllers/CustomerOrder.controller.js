import Order from '../models/Order.model.js';
import Customer from '../models/Customer.model.js';
import OrderToDeliver from '../models/OrderToDeliver.model.js';
import OrderTracking from '../models/OrderTracking.model.js';

export const getOrderHistoryDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    // First check if the order belongs to the customer
    const order = await Order.findOne({
      _id: orderId,
      buyerId: customer._id,
      status: { $in: ['completed', 'cancelled'] }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied.' });
    }

    // Try to find delivery information if it exists
    const orderToDeliver = await OrderToDeliver.findOne({ orderId })
      .populate({
        path: 'orderTrackingId',
        select: 'orderCode'
      })
      .populate({
        path: 'riderId',
        select: 'firstName lastName email telephone facebookLink profilePicture'
      });

    // Get order tracking information separately if not found in OrderToDeliver
    let orderTracking = null;
    if (!orderToDeliver) {
      orderTracking = await OrderTracking.findOne({ orderId })
        .select('orderCode');
    }

    // Populate order details
    const populatedOrder = await Order.findById(orderId)
      .populate({
        path: 'sellerId',
        select: 'storeName storePicture email telephone'
      })
      .populate({
        path: 'items.productId',
        select: 'productName productImage'
      });

    // Build response object
    const response = {
      orderDetails: {
        _id: populatedOrder._id,
        items: populatedOrder.items,
        totalPrice: populatedOrder.totalPrice,
        deliveryAddress: populatedOrder.deliveryAddress,
        sellerAddress: populatedOrder.sellerAddress,
        status: populatedOrder.status,
        createdAt: populatedOrder.createdAt,
        updatedAt: populatedOrder.updatedAt,
        seller: populatedOrder.sellerId
      },
      deliveryInfo: {
        isDelivered: orderToDeliver ? orderToDeliver.isDelivered : false,
        deliveryProof: orderToDeliver ? orderToDeliver.deliveryProof : '',
        orderCode: orderToDeliver ? 
          orderToDeliver.orderTrackingId.orderCode : 
          (orderTracking ? orderTracking.orderCode : 'N/A')
      }
    };

    // Add rider info if available
    if (orderToDeliver && orderToDeliver.riderId) {
      response.riderInfo = {
        _id: orderToDeliver.riderId._id,
        firstname: orderToDeliver.riderId.firstName,
        lastname: orderToDeliver.riderId.lastName,
        email: orderToDeliver.riderId.email,
        telephone: orderToDeliver.riderId.telephone,
        facebookLink: orderToDeliver.riderId.facebookLink,
        profilePicture: orderToDeliver.riderId.profilePicture
      };
    }

    return res.status(200).json({
      message: 'Order history details fetched successfully.',
      data: response
    });
  } catch (error) {
    console.error('[Customer - Get Order History Details]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getCustomerOngoingOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const ongoingStatuses = ['pending', 'confirmed', 'shipped', 'out for delivery'];

    const orders = await Order.find({
      buyerId: customer._id,
      status: { $in: ongoingStatuses }
    })
      .populate({
        path: 'sellerId',
        select: 'storeName storePicture email'
      })
      .populate({
        path: 'items.productId',
        select: 'productName productImage'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Ongoing orders fetched successfully.',
      data: orders
    });
  } catch (error) {
    console.error('[Customer - Get Ongoing Orders]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getOngoingOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyerId: customer._id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied.' });
    }

    const orderToDeliver = await OrderToDeliver.findOne({ orderId })
      .populate({
        path: 'orderId',
        populate: [
          {
            path: 'sellerId',
            select: 'storeName storePicture email telephone'
          },
          {
            path: 'items.productId',
            select: 'productName productImage'
          }
        ]
      })
      .populate({
        path: 'orderTrackingId',
        select: 'orderCode'
      })
      .populate({
        path: 'riderId',
        select: 'firstName lastName email telephone facebookLink profilePicture'
      });

    if (!orderToDeliver) {
      return res.status(404).json({ message: 'Delivery information not found for this order.' });
    }

    const response = {
      orderDetails: {
        _id: orderToDeliver.orderId._id,
        items: orderToDeliver.orderId.items,
        totalPrice: orderToDeliver.orderId.totalPrice,
        deliveryAddress: orderToDeliver.orderId.deliveryAddress,
        sellerAddress: orderToDeliver.orderId.sellerAddress,
        status: orderToDeliver.orderId.status,
        createdAt: orderToDeliver.orderId.createdAt,
        seller: orderToDeliver.orderId.sellerId
      },
      deliveryInfo: {
        isDelivered: orderToDeliver.isDelivered,
        deliveryProof: orderToDeliver.deliveryProof,
        orderCode: orderToDeliver.orderTrackingId.orderCode
      },
      riderInfo: {
        _id: orderToDeliver.riderId._id,
        firstname: orderToDeliver.riderId.firstName,
        lastname: orderToDeliver.riderId.lastName,
        email: orderToDeliver.riderId.email,
        telephone: orderToDeliver.riderId.telephone,
        facebookLink: orderToDeliver.riderId.facebookLink,
        profilePicture: orderToDeliver.riderId.profilePicture
      }
    };

    return res.status(200).json({
      message: 'Order details fetched successfully.',
      data: response
    });
  } catch (error) {
    console.error('[Customer - Get Ongoing Order Details]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getCustomerOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const historyStatuses = ['completed', 'cancelled'];

    const orders = await Order.find({
      buyerId: customer._id,
      status: { $in: historyStatuses }
    })
      .populate({
        path: 'sellerId',
        select: 'storeName storePicture email'
      })
      .populate({
        path: 'items.productId',
        select: 'productName productImage'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Order history fetched successfully.',
      data: orders
    });
  } catch (error) {
    console.error('[Customer - Get Order History]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

