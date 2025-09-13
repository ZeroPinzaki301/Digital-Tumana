// controllers/RiderRating.controller.js
import RiderRating from '../models/RiderRating.model.js';
import OrderToDeliver from '../models/OrderToDeliver.model.js';

// Create a new rider rating
export const createRiderRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { riderId, orderId, rating, message } = req.body;

    // Validate required fields
    if (!riderId || !orderId || !rating) {
      return res.status(400).json({ 
        message: 'Rider ID, Order ID, and rating are required.' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5.' 
      });
    }

    // Find the OrderToDeliver record using orderId
    const orderToDeliver = await OrderToDeliver.findOne({ orderId });
    if (!orderToDeliver) {
      return res.status(404).json({ 
        message: 'Order delivery record not found.' 
      });
    }

    // Check if user has already rated this rider for this order
    const existingRating = await RiderRating.findOne({
      userId,
      orderToDeliverId: orderToDeliver._id
    });

    if (existingRating) {
      return res.status(409).json({ 
        message: 'You have already rated this rider for this order.' 
      });
    }

    // Create new rating
    const newRating = new RiderRating({
      userId,
      riderId,
      orderToDeliverId: orderToDeliver._id,
      rating,
      message: message || null
    });

    await newRating.save();

    // Populate the rider information in the response
    await newRating.populate({
      path: 'riderId',
      select: 'firstName lastName'
    });

    return res.status(201).json({
      message: 'Rider rating submitted successfully.',
      data: newRating
    });
  } catch (error) {
    console.error('[RiderRating - Create]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getMyRiderRatings = async (req, res) => {
  try {
    const riderId = req.user.riderId; // assuming rider token resolves to KaritonService._id

    if (!riderId) {
      return res.status(401).json({ message: 'Unauthorized. Rider ID missing from token.' });
    }

    const ratings = await RiderRating.find({ riderId })
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'orderToDeliverId',
        select: 'orderId'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Your rider ratings fetched successfully.',
      data: ratings
    });
  } catch (error) {
    console.error('[RiderRating - Get My Ratings]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


// Get all rider ratings
export const getAllRiderRatings = async (req, res) => {
  try {
    const ratings = await RiderRating.find()
      .populate({
        path: 'userId',
        select: 'firstName lastName'
      })
      .populate({
        path: 'riderId',
        select: 'firstName lastName'
      })
      .populate({
        path: 'orderToDeliverId',
        select: 'orderId'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Rider ratings fetched successfully.',
      data: ratings
    });
  } catch (error) {
    console.error('[RiderRating - Get All]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get a specific rider rating by ID
export const getRiderRatingById = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await RiderRating.findById(id)
      .populate({
        path: 'userId',
        select: 'firstName lastName'
      })
      .populate({
        path: 'riderId',
        select: 'firstName lastName'
      })
      .populate({
        path: 'orderToDeliverId',
        select: 'orderId'
      });

    if (!rating) {
      return res.status(404).json({ message: 'Rider rating not found.' });
    }

    return res.status(200).json({
      message: 'Rider rating fetched successfully.',
      data: rating
    });
  } catch (error) {
    console.error('[RiderRating - Get By ID]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Check if user has already rated a rider for a specific order
export const checkUserRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    // Find the OrderToDeliver record using orderId
    const orderToDeliver = await OrderToDeliver.findOne({ orderId });
    if (!orderToDeliver) {
      return res.status(404).json({ 
        message: 'Order delivery record not found.' 
      });
    }

    // Check if rating exists
    const existingRating = await RiderRating.findOne({
      userId,
      orderToDeliverId: orderToDeliver._id
    }).populate({
      path: 'riderId',
      select: 'firstName lastName'
    });

    return res.status(200).json({
      message: 'Rating check completed.',
      data: {
        hasRated: !!existingRating,
        rating: existingRating
      }
    });
  } catch (error) {
    console.error('[RiderRating - Check User Rating]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update a rider rating
export const updateRiderRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { rating, message } = req.body;

    // Validate rating range if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5.' 
      });
    }

    // Find the rating and verify ownership
    const existingRating = await RiderRating.findOne({
      _id: id,
      userId
    });

    if (!existingRating) {
      return res.status(404).json({ 
        message: 'Rating not found or you are not authorized to update it.' 
      });
    }

    // Update the rating
    if (rating !== undefined) existingRating.rating = rating;
    if (message !== undefined) existingRating.message = message;

    await existingRating.save();

    // Populate the response
    await existingRating.populate({
      path: 'riderId',
      select: 'firstName lastName'
    });

    return res.status(200).json({
      message: 'Rider rating updated successfully.',
      data: existingRating
    });
  } catch (error) {
    console.error('[RiderRating - Update]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a rider rating
export const deleteRiderRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Find the rating and verify ownership
    const rating = await RiderRating.findOne({
      _id: id,
      userId
    });

    if (!rating) {
      return res.status(404).json({ 
        message: 'Rating not found or you are not authorized to delete it.' 
      });
    }

    await RiderRating.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Rider rating deleted successfully.'
    });
  } catch (error) {
    console.error('[RiderRating - Delete]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get all ratings for a specific rider (Admin only)
export const getRiderRatingsByRiderIdForAdmin = async (req, res) => {
  try {
    const { riderId } = req.params;

    // Validate riderId
    if (!riderId) {
      return res.status(400).json({ 
        message: 'Rider ID is required.' 
      });
    }

    const ratings = await RiderRating.find({ riderId })
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'orderToDeliverId',
        select: 'orderId'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Rider ratings fetched successfully for admin.',
      data: ratings
    });
  } catch (error) {
    console.error('[RiderRating - Get By Rider ID For Admin]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};