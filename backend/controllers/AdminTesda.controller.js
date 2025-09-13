import TesdaEnrollment from "../models/TesdaEnrollment.model.js";
import User from "../models/User.model.js";
import {
  sendTesdaEligibilityEmail,
  sendTesdaReservationEmail,
  sendTesdaEnrollmentEmail,
  sendTesdaGraduationEmail
} from "../utils/emailSender.js";

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

    const enrollment = await TesdaEnrollment.findById(enrollmentId).populate('userId');
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    enrollment.status = status;
    await enrollment.save();

    const { email, firstName } = enrollment.userId;

    switch (status) {
      case 'eligible':
        await sendTesdaEligibilityEmail(email, firstName);
        break;
      case 'reserved':
        await sendTesdaReservationEmail(email, firstName);
        break;
      case 'enrolled':
        await sendTesdaEnrollmentEmail(email, firstName);
        break;
      case 'graduated':
        await sendTesdaGraduationEmail(email, firstName);
        break;
      default:
        // No email for 'pending' or 'cancelled'
        break;
    }

    res.status(200).json({ message: "Status updated and email sent.", enrollment });
  } catch (error) {
    console.error("Error updating enrollment status:", error);
    res.status(500).json({ message: "Failed to update enrollment status." });
  }
};
