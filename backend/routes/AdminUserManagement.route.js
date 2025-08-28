import express from "express";
import { getVerifiedUsersWithRoles } from "../controllers/AdminUserManagement.controller.js";
import { protectSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/verified-users", protectSuperAdmin, getVerifiedUsersWithRoles);

export default router;