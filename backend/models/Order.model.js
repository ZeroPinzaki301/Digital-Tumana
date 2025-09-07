import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      priceAtOrder: { type: Number, required: true },
      itemStatus: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
      }
    }
  ],
  
  totalPrice: { type: Number, required: true },

  deliveryAddress: {
    province: String,
    cityOrMunicipality: String,
    barangay: String,
    street: String,
    postalCode: String,
    latitude: Number,
    longitude: Number,
    telephone: String,
    email: String
  },

  sellerAddress: {
    province: String,
    cityOrMunicipality: String,
    barangay: String,
    street: String,
    postalCode: String,
    latitude: Number,
    longitude: Number,
    telephone: String,
    email: String
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "out for delivery", "completed", "cancelled"],
    default: "pending"
  },

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);