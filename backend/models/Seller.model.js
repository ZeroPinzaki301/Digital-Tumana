import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    sex: { type: String, enum: ["Male", "Female", "Other"], required: true },
    age: { type: Number, required: true, min: 18 },
    birthdate: { type: Date, required: true },
    nationality: { type: String, required: true },
    sellerAddress: { type: mongoose.Schema.Types.ObjectId, ref: "SellerAddress" }, // separate model later
    email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "verified", "unverified", "deleted"],
      default: "pending",
    },
    validIdImage: { type: String, required: true }, // store file path or URL
    dtiCertificateImage: { type: String, required: true },
    birCertificateImage: { type: String, required: true },
    agreedToPolicy: { type: Boolean, default: false, required: true },
    storeName: {
      type: String,
      required: true,
      default: function () {
        return `${this.firstName} ${this.lastName} Store`;
      },
    },
    storePicture: {
      type: String,
      default: "default-profile.png",
    },
  },
  { timestamps: true }
);

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;