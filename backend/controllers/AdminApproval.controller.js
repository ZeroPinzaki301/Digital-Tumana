import Seller from "../models/Seller.model.js";

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