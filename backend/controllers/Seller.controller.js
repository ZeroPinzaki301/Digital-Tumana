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

    // Upload second valid ID if provided
    let secondValidIdImageUrl = null;
    if (req.files?.secondValidId && req.files.secondValidId[0]) {
      const secondValidIdResult = await uploadToCloudinary(
        req.files.secondValidId[0].path, 
        "valid_id_images"
      );
      secondValidIdImageUrl = secondValidIdResult.secure_url;
    }

    const newSeller = new Seller({
      userId: user._id,
      email: user.email,
      firstName,
      middleName,
      lastName,
      sex,
      birthdate,
      nationality,
      validIdImage: validIdResult.secure_url,
      secondValidIdImage: secondValidIdImageUrl,
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

export const deleteSellerByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the most recent seller record for the user
    const [seller] = await Seller.find({ userId }).sort({ createdAt: -1 }).limit(1);

    if (!seller) {
      return res.status(404).json({ message: "Seller record not found" });
    }

    // Delete associated address if it exists
    if (seller.sellerAddress) {
      await SellerAddress.findOneAndDelete({ _id: seller.sellerAddress });
    }

    // Delete the seller document itself
    await Seller.findByIdAndDelete(seller._id);

    res.status(200).json({ message: "Seller record deleted successfully" });
  } catch (err) {
    console.error("Error in deleteSellerByUser:", err.message);
    res.status(500).json({ message: "Failed to delete seller", error: err.message });
  }
};

export const updateStorePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    const [seller] = await Seller.find({ userId }).sort({ createdAt: -1 }).limit(1);
    if (!seller) return res.status(404).json({ message: "Seller record not found" });
    if (!req.file) return res.status(400).json({ message: "No image file uploaded" });

    const result = await uploadToCloudinary(req.file.path, "store_images");

    seller.storePicture = result.secure_url;
    await seller.save();

    res.status(200).json({ message: "Store picture updated", storePicture: seller.storePicture });
  } catch (err) {
    console.error("Error updating store picture:", err.message);
    res.status(500).json({ message: "Failed to upload picture", error: err.message });
  }
};

export const updateStoreName = async (req, res) => {
  try {
    const userId = req.user._id;
    const { storeName } = req.body;

    if (!storeName || typeof storeName !== 'string' || storeName.trim().length === 0) {
      return res.status(400).json({ message: "Invalid store name provided." });
    }

    const [seller] = await Seller.find({ userId }).sort({ createdAt: -1 }).limit(1);
    if (!seller) {
      return res.status(404).json({ message: "Seller record not found." });
    }

    seller.storeName = storeName.trim();
    await seller.save();

    res.status(200).json({ message: "Store name updated successfully.", storeName: seller.storeName });
  } catch (err) {
    console.error("Error updating store name:", err.message);
    res.status(500).json({ message: "Failed to update store name", error: err.message });
  }
};

// 📍 Add seller address
export const addSellerAddressByUser = async (req, res) => {
  try {
    const {
      region, province, cityOrMunicipality, barangay, street, postalCode,
      latitude, longitude, email, telephone
    } = req.body;

    const [seller] = await Seller.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (seller.status !== "verified") return res.status(403).json({ message: "Seller is not verified" });

    if (seller.sellerAddress) {
      const existingAddress = await SellerAddress.findById(seller.sellerAddress);
      if (!existingAddress) {
        // Clean up the broken reference
        seller.sellerAddress = null;
        await seller.save();
      } else {
        return res.status(400).json({ message: "Seller address already exists. Use PUT to update." });
      }
    }

    const newAddress = await SellerAddress.create({
      sellerId: seller._id,
      region, province, cityOrMunicipality, barangay, street, postalCode,
      latitude, longitude, email, telephone
    });

    seller.sellerAddress = newAddress._id;
    await seller.save();

    res.status(201).json({ message: "Seller address added", address: newAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to add seller address", error: err.message });
  }
};

// ✏️ Update seller address
export const updateSellerAddressByUser = async (req, res) => {
  try {
    const {
      region, province, cityOrMunicipality, barangay, street, postalCode,
      latitude, longitude, email, telephone
    } = req.body;

    const [seller] = await Seller.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!seller || seller.status !== "verified") {
      return res.status(403).json({ message: "Seller not verified or does not exist" });
    }

    if (!seller.sellerAddress) {
      return res.status(404).json({ message: "Seller address not found. Try POSTing instead." });
    }

    const updatedAddress = await SellerAddress.findByIdAndUpdate(
      seller.sellerAddress,
      {
        region, province, cityOrMunicipality, barangay, street, postalCode,
        latitude, longitude, email, telephone
      },
      { new: true }
    );

    res.status(200).json({ message: "Seller address updated", address: updatedAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to update address", error: err.message });
  }
};

// 📦 Get seller address
export const getSellerAddressByUser = async (req, res) => {
  try {
    const [seller] = await Seller.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const address = await SellerAddress.findOne({ sellerId: seller._id });
    if (!address) return res.status(404).json({ message: "Seller address not found" });

    res.status(200).json({ address });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve seller address", error: err.message });
  }
};

// ❌ Delete seller address
export const deleteSellerAddressByUser = async (req, res) => {
  try {
    const [seller] = await Seller.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!seller || seller.status !== "verified") {
      return res.status(403).json({ message: "Seller not verified or does not exist" });
    }

    const deletedAddress = await SellerAddress.findOneAndDelete({ sellerId: seller._id });
    if (!deletedAddress) {
      return res.status(404).json({ message: "Seller address not found or already deleted" });
    }

    await Seller.findByIdAndUpdate(seller._id, { $unset: { sellerAddress: "" } });

    res.status(200).json({ message: "Seller address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address", error: err.message });
  }
};