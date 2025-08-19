import mongoose from "mongoose";

// 👤 Schema Definition (same as DeliveryCourier)
const karitonServiceSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true, min: 18 },
  birthdate: { type: Date, required: true },
  houseNo: { type: String, required: true },
  street: { type: String, required: true },
  barangay: { type: String, required: true },
  municipality: { type: String, required: true },
  province: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  facebookLink: { type: String },
  profilePicture: { type: String, default: "default-profile.png" },
  loginCode: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  telephone: { type: String }
});

const KaritonService = mongoose.models.KaritonService || mongoose.model("KaritonService", karitonServiceSchema);
export default KaritonService;