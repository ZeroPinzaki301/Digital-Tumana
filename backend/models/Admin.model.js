import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    adminLoginCode: { type: String, default: null }, // One-time login code
    passChangeCode: { type: String, default: null }, // Reset code
    isSuperadmin: { type: Boolean, default: false }, // Full control flag
    isActive: { type: Boolean, default: true }, // Track if account is active
    verificationCode: { type: String, default: null }, // Email verification code
    verifiedAt: { type: Date, default: null }, // Timestamp for verification
  },
  { timestamps: true } // Ensures `createdAt` and `updatedAt` fields
);

// Hash password before saving the admin
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;