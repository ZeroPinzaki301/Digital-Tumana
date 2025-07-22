import mongoose from "mongoose";

const sellerAddressSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    region: { type: String, required: true },
    province: { type: String, required: true },
    cityOrMunicipality: { type: String, required: true },
    barangay: { type: String, required: true },
    street: { type: String, required: true },
    postalCode: { type: String, required: true },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    email: { type: String, required: true },
    telephone: { type: String, required: true }
  },
  { timestamps: true }
);

const SellerAddress = mongoose.model("SellerAddress", sellerAddressSchema);
export default SellerAddress;