import KaritonService from "../models/KaritonService.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import { 
  sendKaritonRiderRegistrationEmail,
  sendKaritonLoginResetEmail,        // ← Add these imports
  sendKaritonNewLoginCodeEmail       // ← Add these imports
} from "../utils/emailSender.js";

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
      firstName, middleName, lastName, birthdate, houseNo, street,
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
      firstName, middleName, lastName, birthdate, houseNo, street,
      barangay, municipality, province, email, facebookLink,
      profilePicture: profilePictureUrl,
      loginCode
    });

    const savedKaritonService = await newKaritonService.save();

    // ✉️ Send registration email
    await sendKaritonRiderRegistrationEmail(email, firstName, loginCode);

    res.status(201).json(savedKaritonService);

  } catch (err) {
    console.error("[Kariton Service Creation Failed]", err);
    res.status(500).json({
      message: "Failed to create Kariton Service",
      error: err.message
    });
  }
};

// 🔐 Request Login Code Reset
export const forgotLoginCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Forgot login code request received for:", email);

    const rider = await KaritonService.findOne({ email });
    if (!rider) {
      console.warn("No rider found with email:", email);
      return res.status(404).json({ message: "Rider not found" });
    }

    // Generate reset code and set expiration (10 minutes)
    const loginChangeCode = Math.floor(100000 + Math.random() * 900000).toString();
    rider.loginChangeCode = loginChangeCode;
    rider.loginChangeCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await rider.save();
      console.log("Login reset code saved to rider:", loginChangeCode);
    } catch (saveErr) {
      console.error("Failed to save rider:", saveErr);
      return res.status(500).json({ message: "Error saving reset code", error: saveErr.message });
    }

    try {
      await sendKaritonLoginResetEmail(email, rider.firstName, loginChangeCode);
      console.log("Login reset email sent successfully to", email);
    } catch (emailErr) {
      console.error("Email failed to send:", emailErr);
      return res.status(500).json({ message: "Failed to send reset email", error: emailErr.message });
    }

    res.status(200).json({ message: "Login code reset code sent to email" });
  } catch (err) {
    console.error("Unexpected forgotLoginCode error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔐 Verify Login Reset Code
export const verifyLoginResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const rider = await KaritonService.findOne({ email });

    if (!rider) return res.status(404).json({ message: "Rider not found" });

    // Check if code matches and hasn't expired
    if (rider.loginChangeCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    if (rider.loginChangeCodeExpires < new Date()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    res.status(200).json({ 
      message: "Reset code verified successfully",
      verified: true 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔐 Reset Login Code (Generate new permanent login code)
export const resetLoginCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const rider = await KaritonService.findOne({ email });

    if (!rider) return res.status(404).json({ message: "Rider not found" });

    // Verify the reset code first
    if (rider.loginChangeCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    if (rider.loginChangeCodeExpires < new Date()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    // Generate new permanent login code with retry logic
    let newLoginCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      newLoginCode = generateLoginCode();
      const existing = await KaritonService.findOne({ loginCode: newLoginCode });
      if (!existing) isUnique = true;
    }

    if (!isUnique) {
      return res.status(500).json({ message: "Failed to generate unique login code" });
    }

    // Update the rider with new login code and clear reset fields
    rider.loginCode = newLoginCode;
    rider.loginChangeCode = null;
    rider.loginChangeCodeExpires = null;
    
    await rider.save();

    try {
      await sendKaritonNewLoginCodeEmail(email, rider.firstName, newLoginCode);
      console.log("New login code email sent to", email);
    } catch (emailErr) {
      console.error("Failed to send new login code email:", emailErr);
      // Continue anyway since the code was reset successfully
    }

    res.status(200).json({ 
      message: "Login code reset successfully",
      newLoginCode: newLoginCode // You might want to omit this in production for security
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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

// 📋 Get All Riders (Admin)
export const getInactiveRiders = async (req, res) => {
  try {
    const services = await KaritonService.find({isActive: false}).sort({ createdAt: -1 });
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

// 🔍 Validate if Kariton Rider already exists
export const validateKaritonRider = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      birthdate,
      email
    } = req.body;

    // Check if email already exists
    const existingByEmail = await KaritonService.findOne({ email });
    if (existingByEmail) {
      return res.status(200).json({ 
        exists: true, 
        reason: 'email',
        message: "A rider with this email already exists",
        rider: {
          _id: existingByEmail._id,
          firstName: existingByEmail.firstName,
          lastName: existingByEmail.lastName,
          email: existingByEmail.email
        }
      });
    }

    // Check if rider with same name and birthdate exists
    const existingByNameAndBirthdate = await KaritonService.findOne({
      firstName,
      lastName,
      birthdate: new Date(birthdate)
    });

    // If middleName is provided, also check it
    if (middleName) {
      const existingWithMiddleName = await KaritonService.findOne({
        firstName,
        middleName,
        lastName,
        birthdate: new Date(birthdate)
      });

      if (existingWithMiddleName) {
        return res.status(200).json({ 
          exists: true, 
          reason: 'name_birthdate',
          message: "A rider with the same name and birthdate already exists",
          rider: {
            _id: existingWithMiddleName._id,
            firstName: existingWithMiddleName.firstName,
            middleName: existingWithMiddleName.middleName,
            lastName: existingWithMiddleName.lastName,
            birthdate: existingWithMiddleName.birthdate
          }
        });
      }
    }

    if (existingByNameAndBirthdate) {
      return res.status(200).json({ 
        exists: true, 
        reason: 'name_birthdate',
        message: "A rider with the same name and birthdate already exists",
        rider: {
          _id: existingByNameAndBirthdate._id,
          firstName: existingByNameAndBirthdate.firstName,
          middleName: existingByNameAndBirthdate.middleName,
          lastName: existingByNameAndBirthdate.lastName,
          birthdate: existingByNameAndBirthdate.birthdate
        }
      });
    }

    // No existing rider found
    return res.status(200).json({ 
      exists: false, 
      message: "No existing rider found with the provided information" 
    });

  } catch (err) {
    console.error("[Validate Kariton Rider Failed]", err);
    res.status(500).json({ 
      message: "Failed to validate Kariton Rider", 
      error: err.message 
    });
  }
};

export const adminUpdateKaritonServiceStatus = async (req, res) => {
  try {
    const { id } = req.params; // Admin gets the ID from the route
    const { isActive } = req.body;

    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'isActive must be a boolean value (true or false)'
      });
    }

    // Find and update the Kariton service document by ID
    const updatedService = await KaritonService.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: 'Kariton service record not found' });
    }

    res.status(200).json({
      message: 'Kariton service status updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('[Admin Update KaritonService Status Error]', error);
    res.status(500).json({ error: 'Failed to update Kariton service status' });
  }
};