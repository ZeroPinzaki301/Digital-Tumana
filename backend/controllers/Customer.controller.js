import Customer from "../models/Customer.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const createCustomer = async (req, res) => {
  try {
    const {
      fullName,
      region,
      province,
      cityOrMunicipality,
      barangay,
      street,
      postalCode,
      latitude,
      longitude,
      email,
      telephone,
      idType
    } = req.body;

    if (!req.files?.idImage) {
      return res.status(400).json({ message: "ID image is required" });
    }

    const existing = await Customer.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Verification already submitted" });
    }

    const imageUpload = await uploadToCloudinary(
      req.files.idImage[0].path,
      "customer_ids"
    );

    const newCustomer = await Customer.create({
      userId: req.user._id,
      fullName,
      region,
      province,
      cityOrMunicipality,
      barangay,
      street,
      postalCode,
      latitude,
      longitude,
      email,
      telephone,
      idType,
      idImage: imageUpload.secure_url,
      isVerified: false
    });

    res.status(201).json({ message: "Verification submitted", customer: newCustomer });
  } catch (err) {
    res.status(500).json({ message: "Failed to create customer", error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const updates = req.body;

    if (req.files?.idImage) {
      const upload = await uploadToCloudinary(
        req.files.idImage[0].path,
        "customer_ids"
      );
      updates.idImage = upload.secure_url;
    }

    Object.assign(customer, updates);
    await customer.save();

    res.status(200).json({ message: "Customer updated", customer });
  } catch (err) {
    res.status(500).json({ message: "Failed to update customer", error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ userId: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.status(200).json({ message: "Verification withdrawn" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete customer", error: err.message });
  }
};

export const getVerifiedCustomerByUser = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!customer) {
      return res.status(404).json({ message: "No customer record found" });
    }

    if (!customer.isVerified) {
      return res.status(403).json({ message: "Customer is not verified yet", customer });
    }

    res.status(200).json({ customer });
  } catch (err) {
    console.error("Error in getVerifiedCustomerByUser:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};