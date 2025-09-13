import express from "express";
import protect, { protectSuperAdmin } from "../middlewares/authMiddleware.js";
import { protectRider } from "../middlewares/KaritonAuthMiddleware.js";
import { 
  createRiderRating,
  getAllRiderRatings,
  getRiderRatingById,
  checkUserRating,
  updateRiderRating,
  deleteRiderRating,
  getRiderRatingsByRiderIdForAdmin,
  getMyRiderRatings
} from "../controllers/RiderRating.controller.js";

const router = express.Router();

// Create a new rider rating
router.post("/customer/", protect, createRiderRating);

// Get all rider ratings
router.get("/customer/", protect, getAllRiderRatings);

router.get("/my-ratings", protectRider, getMyRiderRatings);

// Get a specific rider rating by ID
router.get("/customer/:id", protect, getRiderRatingById);

// Check if user has already rated a rider for a specific order
router.get("/customer/check/:orderId", protect, checkUserRating);

// Update a rider rating
router.put("/customer/:id", protect, updateRiderRating);

// Delete a rider rating
router.delete("/customer/:id", protect, deleteRiderRating);

// Admin route - Get all ratings for a specific rider
router.get("/admin/:riderId", protectSuperAdmin, getRiderRatingsByRiderIdForAdmin);

export default router;