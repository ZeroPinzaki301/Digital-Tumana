import express from "express";
import protect, { protectSuperAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protectRider } from "../middlewares/KaritonAuthMiddleware.js";

import {
  createKaritonService,
  getAllKaritonServices,
  getInactiveRiders,
  getKaritonServiceById,
  getActiveKaritonServices,
  loginKaritonService,
  validateKaritonRider,
  adminUpdateKaritonServiceStatus,
  forgotLoginCode,
  verifyLoginResetCode,
  resetLoginCode
} from "../controllers/KaritonService.controller.js";

import { 
  getDeliveryRequests,
  getDeliveryDetailsByOrderId,
  updateDeliveryStatus,
  getDeliveryHistory,
  updateKaritonServiceStatus
 } from "../controllers/KaritonRider.controller.js";

const router = express.Router();

router.post("/login", loginKaritonService);

router.post("/forgot-login-code", forgotLoginCode);

router.post("/verify-login-reset-code", verifyLoginResetCode);

router.post("/reset-login-code", resetLoginCode);

router.post('/validate', validateKaritonRider);

router.post("/", protectSuperAdmin, upload.single("profilePicture"), createKaritonService);

router.get("/kariton-riders", getAllKaritonServices);

router.get("/inactive-riders", getInactiveRiders);

router.get("/delivery-requests", protectRider, getDeliveryRequests);

router.get("/delivery-details/:orderId", protectRider, getDeliveryDetailsByOrderId);

router.put(
  "/delivery-status/:orderId",
  protectRider,
  upload.single("deliveryProof"),
  updateDeliveryStatus
);

router.get("/delivery-history", protectRider, getDeliveryHistory);

router.patch("/update-status", protectRider, updateKaritonServiceStatus);

router.patch("/admin/update-status/:id", protectSuperAdmin, adminUpdateKaritonServiceStatus);

router.get("/:id", getKaritonServiceById);

router.get("/active-riders", getActiveKaritonServices);

export default router;