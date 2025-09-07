import Worker from "../models/Worker.model.js";
import WorkerAddress from "../models/WorkerAddress.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const registerWorker = async (req, res) => {
  try {
    const user = req.user;

    const existing = await Worker.findOne({ userId: user._id });
    if (existing) {
      return res.status(409).json({ message: "You already have an existing worker application." });
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

    if (!req.files?.validId) {
      return res.status(400).json({ message: "Valid ID must be uploaded." });
    }

    const validIdResult = await uploadToCloudinary(req.files.validId[0].path, "valid_id_images");
    const resumeResult = req.files?.resumeFile
      ? await uploadToCloudinary(req.files.resumeFile[0].path, "resume_files")
      : null;

    const newWorker = new Worker({
      userId: user._id,
      email: user.email,
      firstName,
      middleName,
      lastName,
      sex,
      birthdate,
      nationality,
      validIdImage: validIdResult.secure_url,
      resumeFile: resumeResult?.secure_url || null,
      agreedToPolicy,
      status: "pending",
    });

    await newWorker.save();

    res.status(201).json({ message: "Worker application submitted successfully.", worker: newWorker });
  } catch (err) {
    console.error("Error in registerWorker:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Verified Worker by User
export const getVerifiedWorkerByUser = async (req, res) => {
  try {
    const [worker] = await Worker.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);

    if (!worker) return res.status(404).json({ message: "Worker not found" });
    if (worker.status === "deleted") return res.status(410).json({ message: "Worker registration was declined" });
    if (worker.status !== "verified") return res.status(403).json({ message: "Worker is not verified yet" });

    res.status(200).json({ worker });
  } catch (err) {
    console.error("Error in getVerifiedWorkerByUser:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🟡 Get Pending Worker by User
export const getPendingWorkerByUser = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id, status: "pending" });
    if (!worker) return res.status(404).json({ message: "No pending worker registration found" });

    res.status(200).json({ worker });
  } catch (err) {
    console.error("Error checking pending worker:", err.message);
    res.status(500).json({ message: "Server error while checking worker registration", error: err.message });
  }
};

// 🗑️ Delete Worker by User
export const deleteWorkerByUser = async (req, res) => {
  try {
    const [worker] = await Worker.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);

    if (!worker) return res.status(404).json({ message: "Worker record not found" });

    if (worker.workerAddress) {
      await WorkerAddress.findOneAndDelete({ _id: worker.workerAddress });
    }

    await Worker.findByIdAndDelete(worker._id);

    res.status(200).json({ message: "Worker record deleted successfully" });
  } catch (err) {
    console.error("Error in deleteWorkerByUser:", err.message);
    res.status(500).json({ message: "Failed to delete worker", error: err.message });
  }
};

export const updateWorkerProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    const [worker] = await Worker.find({ userId }).sort({ createdAt: -1 }).limit(1);
    if (!worker) return res.status(404).json({ message: "Worker record not found" });
    if (!req.file) return res.status(400).json({ message: "No image file uploaded" });

    const result = await uploadToCloudinary(req.file.path, "profile_images");
    worker.profilePicture = result.secure_url;
    await worker.save();

    res.status(200).json({ message: "Profile picture updated", profilePicture: worker.profilePicture });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload profile picture", error: err.message });
  }
};


export const addWorkerAddressByUser = async (req, res) => {
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

    const [worker] = await Worker.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    if (worker.status !== "verified") return res.status(403).json({ message: "Worker is not verified" });

    if (worker.workerAddress) {
      return res.status(400).json({ message: "Worker address already exists. Use PUT to update." });
    }

    const newAddress = await WorkerAddress.create({
      workerId: worker._id,
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

    worker.workerAddress = newAddress._id;
    await worker.save();

    res.status(201).json({ message: "Worker address added", address: newAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to add worker address", error: err.message });
  }
};

export const updateWorkerAddressByUser = async (req, res) => {
  try {
    const updateData = req.body;

    const [worker] = await Worker.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!worker || worker.status !== "verified") {
      return res.status(403).json({ message: "Worker not verified or does not exist" });
    }

    if (!worker.workerAddress) {
      return res.status(404).json({ message: "Worker address not found. Try POSTing instead." });
    }

    const updatedAddress = await WorkerAddress.findByIdAndUpdate(
      worker.workerAddress,
      updateData,
      { new: true }
    );

    res.status(200).json({ message: "Worker address updated", address: updatedAddress });
  } catch (err) {
    res.status(500).json({ message: "Failed to update worker address", error: err.message });
  }
};

export const getWorkerAddressByUser = async (req, res) => {
  try {
    const [worker] = await Worker.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const address = await WorkerAddress.findOne({ workerId: worker._id });
    if (!address) return res.status(404).json({ message: "Worker address not found" });

    res.status(200).json({ address });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve worker address", error: err.message });
  }
};

export const deleteWorkerAddressByUser = async (req, res) => {
  try {
    const [worker] = await Worker.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(1);
    if (!worker || worker.status !== "verified") {
      return res.status(403).json({ message: "Worker not verified or does not exist" });
    }

    const deletedAddress = await WorkerAddress.findOneAndDelete({ workerId: worker._id });
    if (!deletedAddress) {
      return res.status(404).json({ message: "Worker address not found or already deleted" });
    }

    await Worker.findByIdAndUpdate(worker._id, { $unset: { workerAddress: "" } });

    res.status(200).json({ message: "Worker address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete worker address", error: err.message });
  }
};