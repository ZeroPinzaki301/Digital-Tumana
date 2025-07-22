import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getVerifiedCustomerByUser
} from "../controllers/Customer.controller.js";

const router = express.Router();

const customerUpload = upload.fields([
  { name: "idImage", maxCount: 1 }
]);

router.post("/register", protect, customerUpload, createCustomer);

router.get("/dashboard", protect, getVerifiedCustomerByUser);

router.put("/update", protect, customerUpload, updateCustomer);

router.delete("/withdraw", protect, deleteCustomer);

export default router;