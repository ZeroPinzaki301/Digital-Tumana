import express from "express";
import protect, { protectSuperAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protectRider } from "../middlewares/KaritonAuthMiddleware.js";

import {
  createKaritonService,
  getAllKaritonServices,
  getKaritonServiceById,
  getActiveRiders,
  loginKaritonService
} from "../controllers/KaritonService.controller.js";

import { 
  getDeliveryRequests,
  getDeliveryDetailsByOrderId,
  updateDeliveryStatus,
  getDeliveryHistory
 } from "../controllers/KaritonRider.controller.js";

const router = express.Router();

router.post("/login", loginKaritonService);

router.post("/", protectSuperAdmin, upload.single("profilePicture"), createKaritonService);

router.get("/kariton-riders", getAllKaritonServices);

router.get("/delivery-requests", protectRider, getDeliveryRequests);

router.get("/delivery-details/:orderId", protectRider, getDeliveryDetailsByOrderId);

router.put(
  "/delivery-status/:orderId",
  protectRider,
  upload.single("deliveryProof"),
  updateDeliveryStatus
);

router.get("/delivery-history", protectRider, getDeliveryHistory);

router.get("/:id", getKaritonServiceById);

router.get("/active-riders", getActiveRiders);



export default router;