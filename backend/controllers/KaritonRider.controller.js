import OrderToDeliver from '../models/OrderToDeliver.model.js';
import OrderTracking from '../models/OrderTracking.model.js';
import Order from '../models/Order.model.js';
import Customer from '../models/Customer.model.js';

import { uploadToCloudinary } from '../config/cloudinary.js';

export const getDeliveryRequests = async (req, res) => {
  try {
    const { riderId } = req.user;

    // 💡 Step 1: Fetch undelivered orders assigned to this rider
    const deliveries = await OrderToDeliver.find({
      riderId,
      isDelivered: false
    })
      .populate({
        path: 'orderId',
        populate: {
          path: 'buyerId',
          select: 'fullName'
        }
      })
      .populate('orderTrackingId', 'orderCode');

    // 🧠 Step 2: Format results
    const formatted = deliveries.map(delivery => {
      const buyer = delivery.orderId?.buyerId;
      return {
        _id: delivery._id,
        orderCode: delivery.orderTrackingId?.orderCode || '',
        orderId: delivery.orderId?._id || '',
        customerName: buyer
          ? `${buyer.fullName}`
          : 'Unknown',
        deliveryProof: delivery.deliveryProof,
        isDelivered: delivery.isDelivered,
        createdAt: delivery.createdAt
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('[Delivery Controller Error]', error);
    res.status(500).json({ error: 'Failed to fetch delivery requests' });
  }
};

export const getDeliveryHistory = async (req, res) => {
  try {
    const { riderId } = req.user;

    // ✅ Step 1: Fetch delivered orders assigned to this rider
    const deliveries = await OrderToDeliver.find({
      riderId,
      isDelivered: true
    })
      .populate({
        path: 'orderId',
        populate: {
          path: 'buyerId',
          select: 'fullName'
        }
      })
      .populate('orderTrackingId', 'orderCode');

    // 🧹 Step 2: Format results
    const formatted = deliveries.map(delivery => {
      const buyer = delivery.orderId?.buyerId;
      return {
        _id: delivery._id,
        orderCode: delivery.orderTrackingId?.orderCode || '',
        orderId: delivery.orderId?._id || '',
        customerName: buyer ? `${buyer.fullName}` : 'Unknown',
        deliveryProof: delivery.deliveryProof,
        isDelivered: delivery.isDelivered,
        createdAt: delivery.createdAt
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('[Delivery History Controller Error]', error);
    res.status(500).json({ error: 'Failed to fetch delivery history' });
  }
};

export const getDeliveryDetailsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const delivery = await OrderToDeliver.findOne({ orderId })
      .populate({
        path: 'orderTrackingId',
        select: 'orderCode'
      })
      .populate({
        path: 'orderId',
        populate: [
          {
            path: 'buyerId',
            select: 'fullName'
          },
          {
            path: 'items.productId',
            select: 'productName productImage'
          }
        ]
      });

    if (!delivery) return res.status(404).json({ error: 'No delivery found for given orderId' });

    const order = delivery.orderId;
    const buyer = order?.buyerId;
    const items = order?.items || [];

    const formatted = {
      _id: delivery._id,
      orderCode: delivery.orderTrackingId?.orderCode || '',
      buyerName: buyer?.fullName || 'Unknown',
      deliveryAddress: order?.deliveryAddress || {},
      coordinates: {
        latitude: order?.deliveryAddress?.latitude || null,
        longitude: order?.deliveryAddress?.longitude || null
      },
      items: items.map(item => ({
        productId: item.productId?._id || '',
        productName: item.productId?.productName || '',
        productImage: item.productId?.productImage || '',
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        itemStatus: item.itemStatus
      })),
      deliveryProof: delivery.deliveryProof,
      isDelivered: delivery.isDelivered,
      createdAt: delivery.createdAt
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error('[Get Delivery Details Error]', error);
    res.status(500).json({ error: 'Failed to retrieve delivery details' });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Delivery proof image is required.' });
    }

    const result = await uploadToCloudinary(req.file.path, 'delivery_proofs');

    const updated = await OrderToDeliver.findOneAndUpdate(
      { orderId },
      {
        deliveryProof: result.secure_url,
        isDelivered: true
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Delivery record not found.' });
    }

    res.status(200).json({ message: 'Delivery marked as complete.', updated });
  } catch (error) {
    console.error('[Update Delivery Error]', error);
    res.status(500).json({ error: 'Failed to update delivery status.' });
  }
};
