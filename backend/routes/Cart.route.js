import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  addToCart,
  getCartItems,
  removeCartItem,
  getCartPreview
} from "../controllers/Cart.controller.js";

const router = express.Router();

// 📥 Add item to cart
router.post("/add", protect, addToCart);

router.post('/preview', protect, getCartPreview);

// 🧺 Get all cart items
router.get("/items", protect, getCartItems);

// ❌ Remove item from cart by ID
router.delete("/items/:itemId", protect, removeCartItem);

export default router;