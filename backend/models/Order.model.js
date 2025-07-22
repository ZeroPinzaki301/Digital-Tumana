import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  // 🏠 Delivery Snapshot (from Customer)
  deliveryAddress: {
    region: String,
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

  // 🛍 Seller Address Snapshot
  sellerAddress: {
    region: String,
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