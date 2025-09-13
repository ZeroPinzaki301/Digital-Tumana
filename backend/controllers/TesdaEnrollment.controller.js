import TesdaEnrollment from "../models/TesdaEnrollment.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const enrollTesdaCourse = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if already enrolled
    const existingEnrollment = await TesdaEnrollment.findOne({ userId });
    if (existingEnrollment) {
      return res.status(400).json({ message: "You have already enrolled in a TESDA course." });
    }

    const {
      firstName,
      middleName,
      lastName,
      birthdate
    } = req.body;

    // Validate image uploads
    if (!req.files?.birthCertImage || !req.files?.validIdImage || !req.files?.secondValidIdImage) {
      return res.status(400).json({ message: "Birth certificate and valid ID images are required." });
    }

    // Upload to Cloudinary
    const birthCertRes = await uploadToCloudinary(
      req.files.birthCertImage[0].path,
      "tesda_documents"
    );

    const validIdRes = await uploadToCloudinary(
      req.files.validIdImage[0].path,
      "tesda_documents"
    );

    const secondValidIdRes = await uploadToCloudinary(
      req.files.secondValidIdImage[0].path,
      "tesda_documents"
    );

    // Create enrollment
    const newEnrollment = await TesdaEnrollment.create({
      userId,
      firstName,
      middleName,
      lastName,
      birthdate,
      birthCertImage: birthCertRes.secure_url,
      validIdImage: validIdRes.secure_url,
      secondValidIdImage: secondValidIdRes.secure_url,
      status: "pending"
    });

    res.status(201).json({ message: "Enrollment submitted", enrollment: newEnrollment });

  } catch (err) {
    res.status(500).json({ message: "Enrollment failed", error: err.message });
  }
};

export const getUserTesdaEnrollment = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollment = await TesdaEnrollment.findOne({ userId });
    if (!enrollment) {
      return res.status(404).json({ message: "No TESDA enrollment found for this user." });
    }

    res.status(200).json({ enrollment });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch enrollment", error: err.message });
  }
};

export const deleteUserTesdaEnrollment = async (req, res) => {
  try {
    const userId = req.user._id;
    await TesdaEnrollment.findOneAndDelete({ userId });
    res.status(200).json({ message: "Enrollment deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete enrollment." });
  }
};