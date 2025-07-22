import Cart from "../models/Cart.model.js";
import Customer from "../models/Customer.model.js";

// 📥 Add item to cart (or update quantity)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return res.status(403).json({ message: "Customer not found" });

    let cart = await Cart.findOne({ customerId: customer._id });
    if (!cart) cart = await Cart.create({ customerId: customer._id, items: [] });

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, req.body.stockLimit);
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Add to cart failed", error: err.message });
  }
};

// 🧺 View cart items
export const getCartItems = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return res.status(403).json({ message: "Customer not found" });

    const cart = await Cart.findOne({ customerId: customer._id }).populate("items.productId");
    res.status(200).json({ cart: cart || { items: [] } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

// ❌ Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return res.status(403).json({ message: "Customer not found" });

    const cart = await Cart.findOne({ customerId: customer._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item", error: err.message });
  }
};