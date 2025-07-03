import Seller from "../models/Seller.model.js";
import SellerAddress from "../models/SellerAddress.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const registerSeller = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Check if a seller already exists for this user
    const existing = await Seller.findOne({ userId: user._id });
    if (existing) {
      return res.status(409).json({ message: "You already have an existing seller application." });
    }

    const {
      firstName,
      middleName,
      lastName,
      sex,
      age,
      birthdate,
      nationality,
      agreedToPolicy,
    } = req.body;

    if (!req.files?.validId || !req.files?.dtiCert || !req.files?.birCert) {
      return res.status(400).json({ message: "All three required documents must be uploaded." });
    }

    const validIdResult = await uploadToCloudinary(req.files.validId[0].path, "valid_id_images");
    const dtiResult = await uploadToCloudinary(req.files.dtiCert[0].path, "dti_cert_images");
    const birResult = await uploadToCloudinary(req.files.birCert[0].path, "bir_cert_images");

    const newSeller = new Seller({
      userId: user._id,
      email: user.email,
      firstName,
      middleName,
      lastName,
      sex,
      age,
      birthdate,
      nationality,
      validIdImage: validIdResult.secure_url,
      dtiCertificateImage: dtiResult.secure_url,
      birCertificateImage: birResult.secure_url,
      agreedToPolicy,
      status: "pending",
    });

    await newSeller.save();

    res.status(201).json({ message: "Seller application submitted successfully.", seller: newSeller });
  } catch (err) {
    console.error("Error in registerSeller:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getVerifiedSellerByUser = async (req, res) => {
  try {
    const [seller] = await Seller.find({
      userId: req.user._id,
      status: { $ne: "deleted" }, // ✅ filter out deleted
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.status === "deleted") {
      return res.status(410).json({ message: "Seller registration was declined" });
    }

    if (seller.status !== "verified") {
      return res.status(403).json({ message: "Seller is not verified yet" });
    }

    res.status(200).json({ seller });
  } catch (err) {
    console.error("Error in getVerifiedSellerByUser:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addSellerAddress = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    const {
      region,
      province,
      cityOrMunicipality,
      barangay,
      street,
      postalCode,
      latitude,
      longitude,
    } = req.body;

    // Confirm seller exists and is verified
    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (seller.status !== "verified") {
      return res.status(403).json({ message: "Seller is not verified" });
    }

    // Check if address already exists
    if (seller.sellerAddress) {
      return res.status(400).json({ message: "Seller address already exists. Use PUT to update." });
    }

    const newAddress = await SellerAddress.create({
      sellerId,
      region,
      province,
      cityOrMunicipality,
      barangay,
      street,
      postalCode,
      latitude,
      longitude,
    });

    seller.sellerAddress = newAddress._id;
    await seller.save();

    res.status(201).json({ message: "Seller address added", address: newAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to add seller address", error: err.message });
  }
};

export const getPendingSellerByUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const seller = await Seller.findOne({
      userId: req.user._id,
      status: "pending",
    });

    if (!seller) {
      return res.status(404).json({ message: "No pending registration found" });
    }

    res.status(200).json({ seller });
  } catch (err) {
    console.error("Error checking pending seller:", err.message);
    res.status(500).json({
      message: "Server error while checking seller registration",
      error: err.message,
    });
  }
};

export const updateSellerAddress = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    const updateData = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller || seller.status !== "verified") {
      return res.status(403).json({ message: "Seller not verified or does not exist" });
    }

    if (!seller.sellerAddress) {
      return res.status(404).json({ message: "Seller address not found. Try POSTing instead." });
    }

    const updatedAddress = await SellerAddress.findByIdAndUpdate(
      seller.sellerAddress,
      updateData,
      { new: true }
    );

    res.status(200).json({ message: "Seller address updated", address: updatedAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to update address", error: err.message });
  }
};

export const getSellerAddress = async (req, res) => {
  try {
    const { id: sellerId } = req.params;

    const address = await SellerAddress.findOne({ sellerId });
    if (!address) return res.status(404).json({ message: "Seller address not found" });

    res.status(200).json({ address });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve seller address", error: err.message });
  }
};

export const deleteSellerAddress = async (req, res) => {
  try {
    const { id: sellerId } = req.params;

    const deletedAddress = await SellerAddress.findOneAndDelete({ sellerId });
    if (!deletedAddress) {
      return res.status(404).json({ message: "Seller address not found or already deleted" });
    }

    // Unlink from Seller model
    await Seller.findByIdAndUpdate(sellerId, { $unset: { sellerAddress: "" } });

    res.status(200).json({ message: "Seller address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address", error: err.message });
  }
};