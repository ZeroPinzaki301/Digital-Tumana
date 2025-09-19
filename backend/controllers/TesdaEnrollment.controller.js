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
      birthdate,
      usingDefaultValidId,
      validIdImage,
      secondValidIdImage
    } = req.body;

    // Birth certificate must always be uploaded
    if (!req.files?.birthCertImage || !req.files.birthCertImage[0]) {
      return res.status(400).json({ message: "Birth certificate image is required." });
    }

    const birthCertRes = await uploadToCloudinary(
      req.files.birthCertImage[0].path,
      "tesda_documents"
    );

    let validIdImageUrl = null;
    let secondValidIdImageUrl = null;

    // Handle default ID usage
    if (usingDefaultValidId === "true") {
      if (!validIdImage || typeof validIdImage !== "string") {
        return res.status(400).json({ message: "Default valid ID image URL is missing." });
      }
      validIdImageUrl = validIdImage;

      if (secondValidIdImage && typeof secondValidIdImage === "string") {
        secondValidIdImageUrl = secondValidIdImage;
      }
    } else {
      // Handle uploaded valid ID
      if (!req.files?.validIdImage || !req.files.validIdImage[0]) {
        return res.status(400).json({ message: "Valid ID image is required." });
      }

      const validIdRes = await uploadToCloudinary(
        req.files.validIdImage[0].path,
        "tesda_documents"
      );
      validIdImageUrl = validIdRes.secure_url;

      // Handle uploaded second valid ID
      if (req.files?.secondValidIdImage && req.files.secondValidIdImage[0]) {
        const secondValidIdRes = await uploadToCloudinary(
          req.files.secondValidIdImage[0].path,
          "tesda_documents"
        );
        secondValidIdImageUrl = secondValidIdRes.secure_url;
      }
    }

    // Create enrollment record
    const newEnrollment = await TesdaEnrollment.create({
      userId,
      firstName,
      middleName,
      lastName,
      birthdate,
      birthCertImage: birthCertRes.secure_url,
      validIdImage: validIdImageUrl,
      secondValidIdImage: secondValidIdImageUrl,
      status: "pending"
    });

    res.status(201).json({ message: "Enrollment submitted", enrollment: newEnrollment });

  } catch (err) {
    console.error("Error in enrollTesdaCourse:", err);
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
