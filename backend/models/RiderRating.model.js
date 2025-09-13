import mongoose from 'mongoose';

const riderRatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KaritonService',
    required: true
  },
  orderToDeliverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderToDeliver',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  message: {
    type: String,
    default: null
  }
}, { timestamps: true });

const RiderRating = mongoose.models.RiderRating || mongoose.model('RiderRating', riderRatingSchema);
export default RiderRating;