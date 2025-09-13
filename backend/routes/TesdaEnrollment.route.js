import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  enrollTesdaCourse,
  getUserTesdaEnrollment,
  deleteUserTesdaEnrollment
} from "../controllers/TesdaEnrollment.controller.js";

import {
  createBadge,
  getBadge
} from "../controllers/TumanaBachelor.controller.js";

const router = express.Router();

router.post(
  "/enroll",
  protect,
  upload.fields([
    { name: "birthCertImage", maxCount: 1 },
    { name: "validIdImage", maxCount: 1 },
    { name: "secondValidIdImage", maxCount: 1 }
  ]),
  enrollTesdaCourse
);

router.get("/enroll", protect, getUserTesdaEnrollment);
router.delete("/enroll", protect, deleteUserTesdaEnrollment);

router.post(
  "/badge",
  protect,
  upload.single("profilePicture"),
  createBadge
);

router.get("/badge", protect, getBadge);

export default router;