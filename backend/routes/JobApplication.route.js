import express from "express";
import {
  createJobApplication,
  checkExisting,
  getPendingApplications,
  cancelApplication,
  getWorkerConfirmationApplications,
  getWorkerOngoingJobs,
  confirmJobApplication,
  terminateApplication
} from "../controllers/JobApplication.controller.js";

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/apply/:jobId", protect, createJobApplication);
router.get("/check", protect, checkExisting);
router.get("/pending", protect, getPendingApplications);
router.get("/worker-confirmation", protect, getWorkerConfirmationApplications);
router.get("/worker-ongoing", protect, getWorkerOngoingJobs);
router.put("/confirm/:applicationId", protect, confirmJobApplication);
router.put("/cancel/:applicationId", protect, cancelApplication);
router.patch("/terminate/:applicationId", protect, terminateApplication);

export default router;