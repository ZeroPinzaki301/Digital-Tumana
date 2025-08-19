import TesdaEnrollment from "../models/TesdaEnrollment.model.js";

// ✅ Get TESDA enrollments by status
export const getTesdaEnrollmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ['pending', 'eligible', 'reserved', 'enrolled', 'graduated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter." });
    }

    const enrollments = await TesdaEnrollment.find({ status })
      .populate('userId', 'email') // Only get email from User
      .sort({ createdAt: -1 });

    res.status(200).json({ enrollments });
  } catch (error) {
    console.error("Error fetching enrollments by status:", error);
    res.status(500).json({ message: "Failed to retrieve enrollments." });
  }
};

// 🔍 View single enrollment detail
export const getTesdaEnrollmentDetail = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await TesdaEnrollment.findById(enrollmentId)
      .populate('userId', 'email');

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    res.status(200).json({ enrollment });
  } catch (error) {
    console.error("Error fetching enrollment detail:", error);
    res.status(500).json({ message: "Failed to retrieve enrollment detail." });
  }
};

// 🔄 Update enrollment status
export const updateTesdaEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'eligible', 'reserved', 'enrolled', 'cancelled', 'graduated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updated = await TesdaEnrollment.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    res.status(200).json({ message: "Status updated successfully.", enrollment: updated });
  } catch (error) {
    console.error("Error updating enrollment status:", error);
    res.status(500).json({ message: "Failed to update enrollment status." });
  }
};