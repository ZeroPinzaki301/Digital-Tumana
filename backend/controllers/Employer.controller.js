import Employer from "../models/Employer.model.js";
import EmployerAddress from "../models/EmployerAddress.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const registerEmployer = async (req, res) => {
  try {
    const user = req.user;

    const existing = await Employer.findOne({ userId: user._id });
    if (existing) {
      return res.status(409).json({ message: "You already have an existing employer application." });
    }

    const {
      firstName,
      middleName,
      lastName,
      sex,
      age,
      birthdate,
      nationality,
      companyName,
      agreedToPolicy,
    } = req.body;

    if (!req.files?.validId) {
      return res.status(400).json({ message: "Valid ID must be uploaded." });
    }

    const validIdResult = await uploadToCloudinary(req.files.validId[0].path, "valid_id_images");
    const dtiResult = req.files?.dtiCert
      ? await uploadToCloudinary(req.files.dtiCert[0].path, "dti_cert_images")
      : null;
    const birResult = req.files?.birCert
      ? await uploadToCloudinary(req.files.birCert[0].path, "bir_cert_images")
      : null;

    const newEmployer = new Employer({
      userId: user._id,
      email: user.email,
      firstName,
      middleName,
      lastName,
      sex,
      age,
      birthdate,
      nationality,
      companyName,
      validIdImage: validIdResult.secure_url,
      dtiCertificateImage: dtiResult?.secure_url || null,
      birCertificateImage: birResult?.secure_url || null,
      agreedToPolicy,
      status: "pending",
    });

    await newEmployer.save();

    res.status(201).json({ message: "Employer application submitted successfully.", employer: newEmployer });
  } catch (err) {
    console.error("Error in registerEmployer:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getVerifiedEmployerByUser = async (req, res) => {
  try {
    const [employer] = await Employer.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!employer) return res.status(404).json({ message: "Employer not found" });
    if (employer.status === "deleted") return res.status(410).json({ message: "Employer registration was declined" });
    if (employer.status !== "verified") return res.status(403).json({ message: "Employer is not verified yet" });

    res.status(200).json({ employer });
  } catch (err) {
    console.error("Error in getVerifiedEmployerByUser:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getPendingEmployerByUser = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user._id, status: "pending" });
    if (!employer) return res.status(404).json({ message: "No pending employer registration found" });

    res.status(200).json({ employer });
  } catch (err) {
    console.error("Error checking pending employer:", err.message);
    res.status(500).json({ message: "Server error while checking employer registration", error: err.message });
  }
};

export const deleteEmployerByUser = async (req, res) => {
  try {
    const [employer] = await Employer.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!employer) return res.status(404).json({ message: "Employer record not found" });

    if (employer.employerAddress) {
      await EmployerAddress.findOneAndDelete({ _id: employer.employerAddress });
    }

    await Employer.findByIdAndDelete(employer._id);

    res.status(200).json({ message: "Employer record deleted successfully" });
  } catch (err) {
    console.error("Error in deleteEmployerByUser:", err.message);
    res.status(500).json({ message: "Failed to delete employer", error: err.message });
  }
};

export const updateEmployerProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    const [employer] = await Employer.find({ userId }).sort({ createdAt: -1 }).limit(1);
    if (!employer) return res.status(404).json({ message: "Employer record not found" });
    if (!req.file) return res.status(400).json({ message: "No image file uploaded" });

    const result = await uploadToCloudinary(req.file.path, "profile_images");

    employer.profilePicture = result.secure_url;
    await employer.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: employer.profilePicture,
    });
  } catch (err) {
    console.error("Error in updateEmployerProfilePicture:", err);
    res.status(500).json({ message: "Failed to update profile picture", error: err.message });
  }
};

export const addEmployerAddressByUser = async (req, res) => {
  try {
    const {
      region,
      province,
      cityOrMunicipality,
      barangay,
      street,
      postalCode,
      latitude,
      longitude,
      email,
      telephone
    } = req.body;

    const [employer] = await Employer.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!employer) return res.status(404).json({ message: "Employer not found" });
    if (employer.status !== "verified") return res.status(403).json({ message: "Employer is not verified" });

    if (employer.employerAddress) {
      return res.status(400).json({ message: "Employer address already exists. Use PUT to update." });
    }

    const newAddress = await EmployerAddress.create({
      employerId: employer._id,
      region,
      province,
      cityOrMunicipality,
      barangay,
      street,
      postalCode,
      latitude,
      longitude,
      email,
      telephone
    });

    employer.employerAddress = newAddress._id;
    await employer.save();

    res.status(201).json({ message: "Employer address added", address: newAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to add employer address", error: err.message });
  }
};

export const updateEmployerAddressByUser = async (req, res) => {
  try {
    const updateData = req.body;

    const [employer] = await Employer.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!employer || employer.status !== "verified") {
      return res.status(403).json({ message: "Employer not verified or does not exist" });
    }

    if (!employer.employerAddress) {
      return res.status(404).json({ message: "Employer address not found. Try POSTing instead." });
    }

    const updatedAddress = await EmployerAddress.findByIdAndUpdate(
      employer.employerAddress,
      updateData,
      { new: true }
    );

    res.status(200).json({ message: "Employer address updated", address: updatedAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to update employer address", error: err.message });
  }
};

export const getEmployerAddressByUser = async (req, res) => {
  try {
    const [employer] = await Employer.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const address = await EmployerAddress.findOne({ employerId: employer._id });
    if (!address) return res.status(404).json({ message: "Employer address not found" });

    res.status(200).json({ address });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve employer address", error: err.message });
  }
};

export const deleteEmployerAddressByUser = async (req, res) => {
  try {
    const [employer] = await Employer.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!employer || employer.status !== "verified") {
      return res.status(403).json({ message: "Employer not verified or does not exist" });
    }

    const deletedAddress = await EmployerAddress.findOneAndDelete({ employerId: employer._id });
    if (!deletedAddress) {
      return res.status(404).json({ message: "Employer address not found or already deleted" });
    }

    await Employer.findByIdAndUpdate(employer._id, { $unset: { employerAddress: "" } });

    res.status(200).json({ message: "Employer address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employer address", error: err.message });
  }
};