import Order from '../models/Order.model.js';
import Customer from '../models/Customer.model.js';
import OrderToDeliver from '../models/OrderToDeliver.model.js';

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

