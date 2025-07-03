import express from "express";
import {
  getPendingSellerApplications,
  approveOrRejectSeller,
} from "../controllers/AdminApproval.controller.js";
import { protectSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/sellers/pending", protectSuperAdmin, getPendingSellerApplications);
router.patch("/sellers/:sellerId/status", protectSuperAdmin, approveOrRejectSeller);

export default router;