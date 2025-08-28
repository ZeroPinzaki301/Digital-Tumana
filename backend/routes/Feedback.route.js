import express from "express";
import { protectSuperAdmin } from "../middlewares/authMiddleware.js";
import protect from "../middlewares/authMiddleware.js"
import {
  createFeedback,
  getUnseenFeedbacks,
  markFeedbackAsSeen,
  deleteFeedback,
  getSeenFeedbacks
} from "../controllers/Feedback.controller.js";
const router = express.Router();

router.post("/", protect, createFeedback);

router.get("/unseen", protectSuperAdmin, getUnseenFeedbacks);
router.patch("/seen/:feedbackId", protectSuperAdmin, markFeedbackAsSeen);
router.delete("/:feedbackId", protectSuperAdmin, deleteFeedback);
router.get("/seen", protectSuperAdmin, getSeenFeedbacks);

export default router;