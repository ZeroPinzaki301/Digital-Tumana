import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { 
  registerSeller,
  getVerifiedSellerByUser,
  addSellerAddressByUser,
  updateSellerAddressByUser,
  getSellerAddressByUser,
  deleteSellerAddressByUser,
  getPendingSellerByUser,
  deleteSellerByUser,
  updateStorePicture,
  updateStoreName
 } from "../controllers/Seller.controller.js";

const router = express.Router();

const sellerUploads = upload.fields([
  { name: "validId", maxCount: 1 },
  { name: "secondValidId", maxCount: 1 },
  { name: "dtiCert", maxCount: 1 },
  { name: "birCert", maxCount: 1 },
  { name: "storePicture", maxCount: 1 }
]);

router.post("/register", protect, sellerUploads, registerSeller);
router.get("/user", protect, getPendingSellerByUser);
router.get("/dashboard", protect, getVerifiedSellerByUser);
router.delete("/me", protect, deleteSellerByUser)
router.post("/address", protect, addSellerAddressByUser);
router.put("/address", protect, updateSellerAddressByUser);
router.get("/address", protect, getSellerAddressByUser);
router.delete("/address", protect, deleteSellerAddressByUser);
router.put('/store-name', protect, updateStoreName);
router.put("/picture", protect, upload.single("storePicture"), updateStorePicture);



export default router;