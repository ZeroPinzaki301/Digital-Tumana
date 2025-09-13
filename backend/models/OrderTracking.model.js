import mongoose from "mongoose";

const orderTrackingSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
    unique: true,
    default: () => generateSimpleCode()
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Cancelled"],
    default: "Pending"
  },

},  { timestamps: true });

function generateSimpleCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let code = '';

  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 4; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  
  return code;
}

orderTrackingSchema.pre('save', async function(next) {
  if (!this.isNew || this.orderCode) return next();
  
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    this.orderCode = generateSimpleCode();
    
    try {
      const existing = await mongoose.model('OrderTracking').findOne({ 
        orderCode: this.orderCode 
      });
      if (!existing) {
        isUnique = true;
      }
    } catch (err) {
      return next(err);
    }
  }

  if (!isUnique) {
    return next(new Error('Failed to generate unique order code'));
  }

  next();
});

export default mongoose.model("OrderTracking", orderTrackingSchema);