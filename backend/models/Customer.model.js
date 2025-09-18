import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fullName: { type: String, required: true },

  region: { type: String, required: true },
  province: { type: String, required: true },
  cityOrMunicipality: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },

  email: { type: String, required: true },
  telephone: { type: String, required: true },

  idType: {
    type: String,
    enum: ["National ID", "Passport", "Driver's License"],
    required: true
  },
  idImage: { type: String, required: true },
  
  secondIdType: {
    type: String,
    enum: [
      "National ID", 
      "Passport", 
      "Driver's License", 
      "PhilHealth ID", 
      "UMID", 
      "SSS ID", 
      "Barangay ID", 
      "Postal ID", 
      "Voter's ID", 
      "Senior Citizen ID", 
      "PRC ID", 
      "Company ID", 
      "School ID", 
      "TIN ID"
    ]
  },
  secondIdImage: { type: String },
  
  isVerified: { type: Boolean, default: false }

}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
