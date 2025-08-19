import express from "express";
import {
  getTesdaEnrollmentsByStatus,
  getTesdaEnrollmentDetail,
  updateTesdaEnrollmentStatus
} from "../controllers/AdminTesda.controller.js";
import protectSuperAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Get enrollments by status
router.get("/enrollments/status/:status", protectSuperAdmin, getTesdaEnrollmentsByStatus);

// 🔍 View single enrollment detail
router.get("/enrollments/:enrollmentId", protectSuperAdmin, getTesdaEnrollmentDetail);

// 🔄 Update enrollment status
router.put("/enrollments/:enrollmentId/status", protectSuperAdmin, updateTesdaEnrollmentStatus);

export default router;