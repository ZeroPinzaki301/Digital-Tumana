import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailSender.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      phoneNumber,
      agreedToPolicy,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      email,
      password,
      phoneNumber,
      agreedToPolicy,
      verificationCode,
    });

    await newUser.save();

    await sendVerificationEmail(email, firstName, verificationCode);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registration successful. Check your email for the verification code.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User is already verified" });

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified",
        requiresVerification: true,
        email: user.email 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isSeller: user.isSeller,
        isWorker: user.isWorker,
        isEmployer: user.isEmployer,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Forgot password request received for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("No user found with email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const passChangeCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.passChangeCode = passChangeCode;

    try {
      await user.save();
      console.log("Code saved to user:", passChangeCode);
    } catch (saveErr) {
      console.error("Failed to save user:", saveErr);
      return res.status(500).json({ message: "Error saving reset code", error: saveErr.message });
    }

    try {
      await sendPasswordResetEmail(email, passChangeCode);
      console.log("Email sent successfully to", email);
    } catch (emailErr) {
      console.error("Email failed to send:", emailErr);
      return res.status(500).json({ message: "Failed to send reset email", error: emailErr.message });
    }

    res.status(200).json({ message: "Password reset code sent to email" });
  } catch (err) {
    console.error("Unexpected forgotPassword error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.passChangeCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    user.password = newPassword;
    user.passChangeCode = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, middleName, lastName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.middleName = middleName || user.middleName;
    user.lastName = lastName || user.lastName;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({ message: "File too large. Maximum allowed size is 10MB." });
    }

    if (user.profilePicturePublicId) {
      try {
        await deleteFromCloudinary(user.profilePicturePublicId);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }

    const result = await uploadToCloudinary(
      req.file.path,
      'profile_pictures',
      `user_${user._id}_profile`
    );

    user.profilePicture = result.secure_url;
    user.profilePicturePublicId = result.public_id;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).json({ 
      message: "Failed to update profile picture",
      error: err.message 
    });
  }
};