import express from "express";
import { protectSuperAdmin } from "../middlewares/authMiddleware.js";
import {
  createAdmin,
  adminLogin,
  verifyAdminLogin,
  adminForgotPassword,
  adminResetPassword,
  getAdmins,
  registerAdmin,
} from "../controllers/Admin.controller.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/create-admin", protectSuperAdmin, createAdmin);
router.post("/admin-login", adminLogin);
router.post("/verify-admin-login", verifyAdminLogin);
router.post("/admin-forgot-password", adminForgotPassword);
router.post("/admin-reset-password", adminResetPassword);
router.get("/get-admins", protectSuperAdmin, getAdmins);

export default router;