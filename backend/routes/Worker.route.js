import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  registerWorker,
  getVerifiedWorkerByUser,
  getPendingWorkerByUser,
  deleteWorkerByUser,
  addWorkerAddressByUser,
  updateWorkerAddressByUser,
  getWorkerAddressByUser,
  deleteWorkerAddressByUser
} from "../controllers/Worker.controller.js";

const router = express.Router();

const workerUploads = upload.fields([
  { name: "validId", maxCount: 1 },
  { name: "resumeFile", maxCount: 1 }
]);

router.post("/register", protect, workerUploads, registerWorker);
router.get("/user", protect, getPendingWorkerByUser);
router.get("/dashboard", protect, getVerifiedWorkerByUser);
router.delete("/me", protect, deleteWorkerByUser);

router.post("/address", protect, addWorkerAddressByUser);
router.put("/address", protect, updateWorkerAddressByUser);
router.get("/address", protect, getWorkerAddressByUser);
router.delete("/address", protect, deleteWorkerAddressByUser);

export default router;