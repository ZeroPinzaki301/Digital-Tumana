import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import { 
    registerUser, 
    verifyEmail, 
    loginUser, 
    getUserAccount, 
    forgotPassword, 
    resetPassword, 
    updateProfile, 
    updateProfilePicture } from "../controllers/User.controller.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.get("/account", protect, getUserAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);  
router.patch("/update-profile", protect, updateProfile);
router.patch("/update-profile-picture", protect, upload.single("profilePicture"), updateProfilePicture);

export default router;