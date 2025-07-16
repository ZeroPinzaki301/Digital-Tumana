import express from "express";
import {
  // Seller approvals
  getPendingSellerApplications,
  approveOrRejectSeller,
  // Worker approvals
  getPendingWorkerApplications,
  approveOrRejectWorker,
  // Employer approvals
  getPendingEmployerApplications,
  approveOrRejectEmployer,
} from "../controllers/AdminApproval.controller.js";

import { protectSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🛒 Seller routes
router.get("/sellers/pending", protectSuperAdmin, getPendingSellerApplications);
router.patch("/sellers/:sellerId/status", protectSuperAdmin, approveOrRejectSeller);

// 👷 Worker routes
router.get("/workers/pending", protectSuperAdmin, getPendingWorkerApplications);
router.patch("/workers/:workerId/status", protectSuperAdmin, approveOrRejectWorker);

// 🧑‍💼 Employer routes
router.get("/employers/pending", protectSuperAdmin, getPendingEmployerApplications);
router.patch("/employers/:employerId/status", protectSuperAdmin, approveOrRejectEmployer);

export default router;