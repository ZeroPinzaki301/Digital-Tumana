import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  registerEmployer,
  getVerifiedEmployerByUser,
  getPendingEmployerByUser,
  deleteEmployerByUser,
  addEmployerAddressByUser,
  updateEmployerAddressByUser,
  getEmployerAddressByUser,
  deleteEmployerAddressByUser
} from "../controllers/Employer.controller.js";

const router = express.Router();

const employerUploads = upload.fields([
  { name: "validId", maxCount: 1 },
  { name: "dtiCert", maxCount: 1 },
  { name: "birCert", maxCount: 1 }
]);

router.post("/register", protect, employerUploads, registerEmployer);
router.get("/user", protect, getPendingEmployerByUser);
router.get("/dashboard", protect, getVerifiedEmployerByUser);
router.delete("/me", protect, deleteEmployerByUser);

router.post("/address", protect, addEmployerAddressByUser);
router.put("/address", protect, updateEmployerAddressByUser);
router.get("/address", protect, getEmployerAddressByUser);
router.delete("/address", protect, deleteEmployerAddressByUser);

export default router;