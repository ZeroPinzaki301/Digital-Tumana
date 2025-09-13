import Seller from "../models/Seller.model.js";
import Worker from "../models/Worker.model.js";
import Employer from "../models/Employer.model.js";
import Customer from "../models/Customer.model.js";
import {
  sendSellerApprovalEmail,
  sendSellerRejectionEmail,
  sendEmployerApprovalEmail,
  sendEmployerRejectionEmail,
  sendWorkerApprovalEmail,
  sendWorkerRejectionEmail,
  sendCustomerApprovalEmail,
  sendCustomerRejectionEmail
} from "../utils/emailSender.js";

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
    const { status, reason } = req.body;

    if (!["verified", "deleted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'verified' or 'deleted'" });
    }

    const seller = await Seller.findById(sellerId).populate("userId", "email");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const previousStatus = seller.status;
    seller.status = status;
    await seller.save();

    // Send email notification based on status change
    if (status === "verified" && previousStatus === "pending") {
      await sendSellerApprovalEmail(seller.userId.email, `${seller.firstName} ${seller.lastName}`, seller.storeName);
    } else if (status === "deleted" && previousStatus === "pending") {
      await sendSellerRejectionEmail(seller.userId.email, `${seller.firstName} ${seller.lastName}`, seller.storeName, reason || "");
    }

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
    const { status, reason } = req.body;

    if (!["verified", "deleted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'verified' or 'deleted'" });
    }

    const worker = await Worker.findById(workerId).populate("userId", "email");
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const previousStatus = worker.status;
    worker.status = status;
    await worker.save();

    // Send email notification based on status change
    if (status === "verified" && previousStatus === "pending") {
      await sendWorkerApprovalEmail(worker.userId.email, `${worker.firstName} ${worker.lastName}`);
    } else if (status === "deleted" && previousStatus === "pending") {
      await sendWorkerRejectionEmail(worker.userId.email, `${worker.firstName} ${worker.lastName}`, reason || "");
    }

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
    const { status, reason } = req.body;

    if (!["verified", "deleted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'verified' or 'deleted'" });
    }

    const employer = await Employer.findById(employerId).populate("userId", "email");
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const previousStatus = employer.status;
    employer.status = status;
    await employer.save();

    // Send email notification based on status change
    if (status === "verified" && previousStatus === "pending") {
      await sendEmployerApprovalEmail(employer.userId.email, `${employer.firstName} ${employer.lastName}`, employer.companyName);
    } else if (status === "deleted" && previousStatus === "pending") {
      await sendEmployerRejectionEmail(employer.userId.email, `${employer.firstName} ${employer.lastName}`, employer.companyName, reason || "");
    }

    res.status(200).json({ message: `Employer has been ${status}`, employer });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update employer approval status",
      error: err.message,
    });
  }
};

// 📌 Get all customers pending approval
export const getPendingCustomerApplications = async (req, res) => {
  try {
    const pendingCustomers = await Customer.find({ isVerified: false }).populate("userId", "email");
    res.status(200).json({ customers: pendingCustomers });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch pending customer applications",
      error: err.message
    });
  }
};

// Approve customer (mark as verified)
export const approveCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId).populate("userId", "email");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const wasVerified = customer.isVerified;
    customer.isVerified = true;
    await customer.save();

    // Send approval email only if the customer wasn't already verified
    if (!wasVerified) {
      await sendCustomerApprovalEmail(customer.userId.email, customer.fullName);
    }

    res.status(200).json({ message: "Customer has been verified", customer });
  } catch (err) {
    res.status(500).json({
      message: "Failed to verify customer",
      error: err.message
    });
  }
};

// Reject customer (delete record)
export const rejectCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { reason } = req.body;

    const customer = await Customer.findById(customerId).populate("userId", "email");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Send rejection email before deleting
    await sendCustomerRejectionEmail(customer.userId.email, customer.fullName, reason || "");

    await Customer.findByIdAndDelete(customerId);

    res.status(200).json({ message: "Customer verification has been rejected" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to reject customer",
      error: err.message
    });
  }
};