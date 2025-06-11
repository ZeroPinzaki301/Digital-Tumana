import express from "express";
import { registerUser, verifyEmail, loginUser, getUserAccount, forgotPassword, resetPassword, updateProfile, updateProfilePicture } from "../controllers/User.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.get("/account", getUserAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);  
router.patch("/update-profile", updateProfile);
router.patch("/update-profile-picture", updateProfilePicture);

export default router;