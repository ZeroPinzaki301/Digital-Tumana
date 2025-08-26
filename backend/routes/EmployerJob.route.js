import express from "express";
import {
  createJob,
  getEmployerJobs,
  updateJob,
  deleteJob,
  getSingleJob
} from "../controllers/EmployerJob.controller.js";

import { 
  getEmployerJobApplications,
  getWorkerApplicationDetails,
  updateJobApplicationStatus,
  getEmployerOngoingJobs,
  getWorkerJobHistoryById
 } from "../controllers/EmployerApplicationRequests.controller.js";

import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// 📤 Create a job
router.post(
  "/",
  protect,
  upload.fields([
    { name: "jobImage", maxCount: 1 },
    { name: "extraImages", maxCount: 5 },
  ]),
  createJob
);

router.get("/", protect, getEmployerJobs);

router.get("/:jobId", protect, getSingleJob);

router.put("/:jobId", protect, updateJob);

router.delete("/:jobId", protect, deleteJob);

router.get("/applications/requests", protect, getEmployerJobApplications);

router.get("/applications/ongoing", protect, getEmployerOngoingJobs);

router.get('/:workerId/details', getWorkerApplicationDetails);

router.get('/worker-history/:workerId', protect, getWorkerJobHistoryById);

router.put('/application/:applicationId/status', protect, updateJobApplicationStatus);


export default router;