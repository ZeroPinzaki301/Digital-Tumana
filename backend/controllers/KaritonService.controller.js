import KaritonService from "../models/KaritonService.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

// 🔐 Login Code Generator
function generateLoginCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 4; i++) code += digits.charAt(Math.floor(Math.random() * digits.length));
  return code;
}

// 🆕 Enhanced Token Generator with riderId and metadata
const generateToken = (rider) => {
  return jwt.sign(
    {
      riderId: rider._id,
      email: rider.email,
      fullName: `${rider.firstName} ${rider.lastName}`
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// 🚀 Rider Login
export const loginKaritonService = async (req, res) => {
  const { loginCode } = req.body;

  try {
    const rider = await KaritonService.findOne({ loginCode });

    if (!rider) {
      return res.status(404).json({ message: "Invalid login code" });
    }

    const token = generateToken(rider);

    res.status(200).json({
      _id: rider._id,
      firstName: rider.firstName,
      lastName: rider.lastName,
      email: rider.email,
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// 👤 Create New Kariton Rider
export const createKaritonService = async (req, res) => {
  try {
    const {
      firstName, lastName, age, birthdate, houseNo, street,
      barangay, municipality, province, email, facebookLink
    } = req.body;

    let profilePictureUrl = "default-profile.png";
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.path, "kariton_profiles");
      profilePictureUrl = cloudinaryResult.secure_url;
    }

    // 🎯 Generate unique loginCode with retry logic
    let loginCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      loginCode = generateLoginCode();
      const existing = await KaritonService.findOne({ loginCode });
      if (!existing) isUnique = true;
    }

    if (!isUnique) {
      return res.status(500).json({ message: "Failed to generate unique login code" });
    }

    const newKaritonService = new KaritonService({
      firstName, lastName, age, birthdate, houseNo, street,
      barangay, municipality, province, email, facebookLink,
      profilePicture: profilePictureUrl,
      loginCode
    });

    const savedKaritonService = await newKaritonService.save();
    res.status(201).json(savedKaritonService);

  } catch (err) {
    console.error("[Kariton Service Creation Failed]", err);
    res.status(500).json({
      message: "Failed to create Kariton Service",
      error: err.message
    });
  }
};

// 📋 Get All Riders (Admin)
export const getAllKaritonServices = async (req, res) => {
  try {
    const services = await KaritonService.find({isActive: true}).sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (err) {
    console.error("[Get Kariton Services Failed]", err);
    res.status(500).json({ message: "Failed to fetch Kariton Service data", error: err.message });
  }
};

// 🔍 Get Specific Rider by ID
export const getKaritonServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await KaritonService.findById(id);
    if (!rider) {
      return res.status(404).json({ message: "Kariton Rider not found" });
    }
    res.status(200).json(rider);
  } catch (err) {
    console.error("[Get Rider By ID Failed]", err);
    res.status(500).json({
      message: "Failed to fetch Kariton Rider details",
      error: err.message
    });
  }
};


// 📦 Controller to get all active Kariton Service entries
export const getActiveKaritonServices = async (req, res) => {
  try {
    const activeServices = await KaritonService.find({ isActive: true });
    res.status(200).json(activeServices);
  } catch (error) {
    console.error("Error fetching active Kariton services:", error);
    res.status(500).json({ message: "Server error while fetching data." });
  }
};
