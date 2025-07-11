import mongoose from "mongoose";

const employerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  sex: { type: String, enum: ["Male", "Female", "Other"], required: true },
  age: { type: Number, required: true, min: 18 },
  birthdate: { type: Date, required: true },
  nationality: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  validIdImage: { type: String, required: true },
  dtiCertificateImage: { type: String }, // optional
  birCertificateImage: { type: String }, // optional
  companyName: { type: String, required: true },
  employerAddress: { type: mongoose.Schema.Types.ObjectId, ref: "EmployerAddress" },
  agreedToPolicy: { type: Boolean, default: false, required: true },
  profilePicture: { type: String, default: "default-profile.png" },
  status: {
    type: String,
    enum: ["pending", "verified", "deleted"],
    default: "pending",
  },
}, { timestamps: true });

const Employer = mongoose.model("Employer", employerSchema);
export default Employer