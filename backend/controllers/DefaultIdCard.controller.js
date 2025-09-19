import DefaultIdCard from "../models/DefaultIdCard.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const createDefaultIdCard = async (req, res) => {
  try {
    const {
      idType,
      secondIdType
    } = req.body;

    if (!req.files?.idImage) {
      return res.status(400).json({ message: "Primary ID image is required" });
    }

    const existing = await DefaultIdCard.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Default ID card already exists" });
    }

    const idImageUpload = await uploadToCloudinary(
      req.files.idImage[0].path,
      "id_cards"
    );

    let secondIdImageUrl = null;
    if (req.files?.secondIdImage && secondIdType) {
      const secondIdImageUpload = await uploadToCloudinary(
        req.files.secondIdImage[0].path,
        "id_cards"
      );
      secondIdImageUrl = secondIdImageUpload.secure_url;
    }

    const newDefaultIdCard = await DefaultIdCard.create({
      userId: req.user._id,
      idType,
      idImage: idImageUpload.secure_url,
      secondIdType,
      secondIdImage: secondIdImageUrl
    });

    res.status(201).json({ message: "Default ID card created", defaultIdCard: newDefaultIdCard });
  } catch (err) {
    res.status(500).json({ message: "Failed to create default ID card", error: err.message });
  }
};

export const updateDefaultIdCard = async (req, res) => {
  try {
    const defaultIdCard = await DefaultIdCard.findOne({ userId: req.user._id });
    if (!defaultIdCard) return res.status(404).json({ message: "Default ID card not found" });

    const updates = req.body;

    if (req.files?.idImage) {
      const upload = await uploadToCloudinary(
        req.files.idImage[0].path,
        "id_cards"
      );
      updates.idImage = upload.secure_url;
    }

    if (req.files?.secondIdImage) {
      const upload = await uploadToCloudinary(
        req.files.secondIdImage[0].path,
        "id_cards"
      );
      updates.secondIdImage = upload.secure_url;
    }

    Object.assign(defaultIdCard, updates);
    await defaultIdCard.save();

    res.status(200).json({ message: "Default ID card updated", defaultIdCard });
  } catch (err) {
    res.status(500).json({ message: "Failed to update default ID card", error: err.message });
  }
};

export const deleteDefaultIdCard = async (req, res) => {
  try {
    const defaultIdCard = await DefaultIdCard.findOneAndDelete({ userId: req.user._id });
    if (!defaultIdCard) return res.status(404).json({ message: "Default ID card not found" });

    res.status(200).json({ message: "Default ID card deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete default ID card", error: err.message });
  }
};

export const getDefaultIdCardByUser = async (req, res) => {
  try {
    const defaultIdCard = await DefaultIdCard.findOne({ userId: req.user._id });

    if (!defaultIdCard) {
      return res.status(404).json({ message: "No default ID card found" });
    }

    res.status(200).json({ defaultIdCard });
  } catch (err) {
    console.error("Error in getDefaultIdCardByUser:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getDefaultIdCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const defaultIdCard = await DefaultIdCard.findById(id).populate('userId', 'username email');

    if (!defaultIdCard) {
      return res.status(404).json({ message: "Default ID card not found" });
    }

    res.status(200).json({ defaultIdCard });
  } catch (err) {
    console.error("Error in getDefaultIdCardById:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
