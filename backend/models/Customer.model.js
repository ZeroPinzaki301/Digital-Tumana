import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fullName: { type: String, required: true },

  // 🏠 Address Breakdown
  region: { type: String, required: true },
  province: { type: String, required: true },
  cityOrMunicipality: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },

  // 📬 Contact
  email: { type: String, required: true },
  telephone: { type: String, required: true },

  // 🧾 Identity Verification
  idType: {
    type: String,
    enum: ["National ID", "Passport", "Driver's License"],
    required: true
  },
  idImage: { type: String, required: true }, // Cloudinary-secured URL
  isVerified: { type: Boolean, default: false }

}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;