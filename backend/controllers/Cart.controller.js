import Cart from "../models/Cart.model.js";
import Customer from "../models/Customer.model.js";
import Product from "../models/Product.model.js";
import Seller from "../models/Seller.model.js";

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

export const getCartItems = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return res.status(403).json({ message: "Customer not found" });

    const cart = await Cart.findOne({ customerId: customer._id }).populate({
      path: "items.productId",
      match: {
        durationEnd: false,
        stock: { $gt: 0 }
      }
    });

    // Filter out items where product is null (unavailable)
    const availableItems = cart ? cart.items.filter(item => item.productId !== null) : [];
    
    res.status(200).json({ 
      cart: {
        _id: cart?._id,
        customerId: cart?.customerId,
        items: availableItems
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

export const getCartPreview = async (req, res) => {
  try {
    const { selectedItems } = req.body; // Array of selected item IDs
    
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return res.status(403).json({ message: "Customer not found" });

    const cart = await Cart.findOne({ customerId: customer._id }).populate({
      path: "items.productId",
      match: {
        durationEnd: false,
        stock: { $gt: 0 }
      }
    });

    // Filter cart items based on selected items
    let availableItems = cart ? cart.items.filter(item => item.productId !== null) : [];
    
    // If specific items are selected, filter to only those
    if (selectedItems && selectedItems.length > 0) {
      availableItems = availableItems.filter(item => 
        selectedItems.includes(item._id.toString())
      );
    }

    // Format the response for preview
    const items = await Promise.all(availableItems.map(async (item) => {
      const product = item.productId;
      const seller = await Seller.findById(product.sellerId);
      
      return {
        product: {
          name: product.productName,
          type: product.category,
          unit: product.unitType,
          quantity: item.quantity,
          price: product.pricePerUnit,
          image: product.productImage
        },
        seller: {
          storeName: seller.storeName,
          region: seller.region,
          telephone: seller.telephone,
          email: seller.email
        },
        summary: {
          subtotal: item.quantity * product.pricePerUnit,
          total: item.quantity * product.pricePerUnit
        }
      };
    }));

    // Get customer delivery address
    const deliveryTo = {
      fullName: customer.fullName,
      street: customer.street,
      barangay: customer.barangay,
      cityOrMunicipality: customer.cityOrMunicipality,
      province: customer.province,
      region: customer.region,
      telephone: customer.telephone,
      email: customer.email,
      latitude: customer.latitude,
      longitude: customer.longitude,
      postalCode: customer.postalCode
    };

    res.status(200).json({ items, deliveryTo });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart preview", error: err.message });
  }
};

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
