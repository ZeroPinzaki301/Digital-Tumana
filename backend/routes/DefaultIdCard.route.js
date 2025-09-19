import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  createDefaultIdCard,
  updateDefaultIdCard,
  deleteDefaultIdCard,
  getDefaultIdCardByUser,
  getDefaultIdCardById
} from "../controllers/DefaultIdCard.controller.js";

const router = express.Router();

const idCardUpload = upload.fields([
  { name: "idImage", maxCount: 1 },
  { name: "secondIdImage", maxCount: 1 }
]);

// RESTful routes
router.route("/")
  .post(protect, idCardUpload, createDefaultIdCard)
  .get(protect, getDefaultIdCardByUser)
  .put(protect, idCardUpload, updateDefaultIdCard)
  .delete(protect, deleteDefaultIdCard);

// Additional route for getting specific ID card by ID
router.get("/:id", protect, getDefaultIdCardById);

export default router;
