import mongoose from 'mongoose';

const orderToDeliverSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderTrackingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderTracking',
    required: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KaritonService',
    required: true
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveryProof: {
    type: String, // URL or filename of image
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('OrderToDeliver', orderToDeliverSchema);