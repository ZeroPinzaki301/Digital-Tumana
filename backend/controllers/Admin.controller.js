import Admin from "../models/Admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendAdminVerificationEmail, sendAdminResetEmail } from "../utils/emailSender.js";

// Create Admin (Only Super Admin can do this)
export const createAdmin = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, phoneNumber, isSuperadmin } = req.body;
    const superAdmin = await Admin.findById(req.admin.id);

    if (!superAdmin || !superAdmin.isSuperadmin) {
      return res.status(403).json({ message: "Unauthorized: Only Super Admin can create admins" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin email already exists" });
    }

    const admin = new Admin({
      firstName,
      middleName,
      lastName,
      email,
      password,
      phoneNumber,
      isSuperadmin: isSuperadmin || false,
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Register as new admin
export const registerAdmin = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, phoneNumber } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin email already exists" });
    }

    const admin = new Admin({
      firstName,
      middleName,
      lastName,
      email,
      password,
      phoneNumber,
      isSuperadmin: false, // Default to regular admin
    });

    await admin.save();
    res.status(201).json({ message: "Admin registered successfully. Please verify your email." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin Login with Email Verification
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate & send a one-time login verification code
    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    admin.adminLoginCode = loginCode;
    await admin.save();

    await sendAdminVerificationEmail(email, admin.firstName, loginCode);

    res.status(200).json({ message: "Verification code sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify Admin Login Code (Step 2 of Login)
export const verifyAdminLogin = async (req, res) => {
  try {
    const { email, code } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.adminLoginCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Generate JWT token after successful verification
    const token = jwt.sign({ id: admin._id, isSuperadmin: admin.isSuperadmin }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    admin.adminLoginCode = null;
    await admin.save();

    res.status(200).json({ message: "Login successful", token, admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Forgot Password for Admin
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const passChangeCode = Math.floor(100000 + Math.random() * 900000).toString();
    admin.passChangeCode = passChangeCode;
    await admin.save();

    await sendAdminResetEmail(email, passChangeCode);
    res.status(200).json({ message: "Password reset code sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reset Password for Admin
export const adminResetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.passChangeCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    admin.password = newPassword;
    admin.passChangeCode = null;
    await admin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Super Admin Viewing All Admins
export const getAdmins = async (req, res) => {
  try {
    const superAdmin = await Admin.findById(req.admin.id);

    if (!superAdmin || !superAdmin.isSuperadmin) {
      return res.status(403).json({ message: "Unauthorized: Only Super Admin can view admins" });
    }

    const admins = await Admin.find().select("-password");
    res.status(200).json({ admins });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};