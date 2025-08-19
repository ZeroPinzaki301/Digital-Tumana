import mongoose from 'mongoose';

const sellerBalanceWithdrawalSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  bankNumber: {
    type: String,
    required: true,
    trim: true
  },
  withdrawalAmount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('SellerBalanceWithdrawal', sellerBalanceWithdrawalSchema);