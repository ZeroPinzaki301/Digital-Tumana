import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/emailSender.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
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
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User is already verified" });

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null; // Clear the code after verification
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

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Redirecting to verification page...",
        redirect: "/verify-email",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
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
    const user = await User.findById(req.user.id).select("-password"); // Exclude password

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const passChangeCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.passChangeCode = passChangeCode;
    await user.save();

    await sendPasswordResetEmail(email, passChangeCode);

    res.status(200).json({ message: "Password reset code sent to email" });
  } catch (err) {
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

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passChangeCode = null; // Clear reset code
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Allow only permitted fields to be updated
    user.firstName = firstName || user.firstName;
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
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePicture = req.file.path; // Save new profile picture
    await user.save();

    res.status(200).json({ message: "Profile picture updated", profilePicture: user.profilePicture });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};








