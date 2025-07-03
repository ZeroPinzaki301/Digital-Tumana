import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { 
  registerSeller,
  getVerifiedSellerByUser,
  addSellerAddress,
  updateSellerAddress,
  getSellerAddress,
  deleteSellerAddress,
  getPendingSellerByUser
 } from "../controllers/Seller.controller.js";

const router = express.Router();

const sellerUploads = upload.fields([
  { name: "validId", maxCount: 1 },
  { name: "dtiCert", maxCount: 1 },
  { name: "birCert", maxCount: 1 }
]);

router.post("/register", protect, sellerUploads, registerSeller);
router.get("/user", protect, getPendingSellerByUser);
router.get("/dashboard", protect, getVerifiedSellerByUser);
router.post("/:id/address", protect, addSellerAddress);
router.put("/:id/address", protect, updateSellerAddress);
router.get("/:id/address", protect, getSellerAddress);
router.delete("/:id/address", protect, deleteSellerAddress);



export default router;