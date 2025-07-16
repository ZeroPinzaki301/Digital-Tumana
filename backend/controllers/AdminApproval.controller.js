import Seller from "../models/Seller.model.js";
import Worker from "../models/Worker.model.js";
import Employer from "../models/Employer.model.js";

// Get all sellers pending approval
export const getPendingSellerApplications = async (req, res) => {
  try {
    const pendingSellers = await Seller.find({ status: "pending" }).populate("userId", "email");
    res.status(200).json({ sellers: pendingSellers });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch pending seller applications",
      error: err.message,
    });
  }
};

// Update seller approval status (verify or unverify)
export const approveOrRejectSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status } = req.body;

    if (!["verified", "deleted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'verified' or 'deleted'" });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.status = status;
    await seller.save();

    res.status(200).json({ message: `Seller has been ${status}`, seller });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update seller approval status",
      error: err.message,
    });
  }
};

// Get all workers pending approval
export const getPendingWorkerApplications = async (req, res) => {
  try {
    const pendingWorkers = await Worker.find({ status: "pending" }).populate("userId", "email");
    res.status(200).json({ workers: pendingWorkers });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch pending worker applications",
      error: err.message,
    });
  }
};

// Update worker approval status
export const approveOrRejectWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { status } = req.body;

    if (!["verified", "deleted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'verified' or 'deleted'" });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    worker.status = status;
    await worker.save();

    res.status(200).json({ message: `Worker has been ${status}`, worker });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update worker approval status",
      error: err.message,
    });
  }
};

// Get all employers pending approval
export const getPendingEmployerApplications = async (req, res) => {
  try {
    const pendingEmployers = await Employer.find({ status: "pending" }).populate("userId", "email");
    res.status(200).json({ employers: pendingEmployers });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch pending employer applications",
      error: err.message,
    });
  }
};

// Update employer approval status
export const approveOrRejectEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { status } = req.body;

    if (!["verified", "deleted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'verified' or 'deleted'" });
    }

    const employer = await Employer.findById(employerId);
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    employer.status = status;
    await employer.save();

    res.status(200).json({ message: `Employer has been ${status}`, employer });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update employer approval status",
      error: err.message,
    });
  }
};
