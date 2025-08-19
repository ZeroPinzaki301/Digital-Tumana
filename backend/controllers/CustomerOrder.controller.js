import Order from '../models/Order.model.js';
import Customer from '../models/Customer.model.js';

export const getCustomerOngoingOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the customer profile linked to the logged-in user
    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    // Define ongoing statuses
    const ongoingStatuses = ['pending', 'confirmed', 'shipped', 'out for delivery'];

    // Fetch orders with full population
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

export const getCustomerOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the customer profile linked to the logged-in user
    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    // Define historical statuses
    const historyStatuses = ['completed', 'cancelled'];

    // Fetch historical orders with full population
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
