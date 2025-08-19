import mongoose from 'mongoose';

const sellerBalanceSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  bankNumber: {
    type: String,
    trim: true,
    unique: true,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('SellerBalance', sellerBalanceSchema);