import Order from "../models/Order.model.js";
import Customer from "../models/Customer.model.js";
import Product from "../models/Product.model.js";
import Seller from "../models/Seller.model.js";
import SellerAddress from "../models/SellerAddress.model.js";
import Cart from "../models/Cart.model.js";

// 📖 Preview single item before placing
export const previewOrder = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id, isVerified: true });
    if (!customer) return res.status(403).json({ message: "Customer must be verified" });

    const product = await Product.findById(req.params.productId).populate("sellerId");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const quantity = parseInt(req.query.quantity) || 1;
    if (quantity > product.stock) {
      return res.status(400).json({ message: "Requested quantity exceeds stock" });
    }

    const sellerAddress = await SellerAddress.findOne({ sellerId: product.sellerId._id });
    if (!sellerAddress) return res.status(404).json({ message: "Seller address not found" });

    const subtotal = quantity * product.pricePerUnit;
    const shippingFee = 50;
    const total = subtotal + shippingFee;

    res.status(200).json({
      product: {
        name: product.productName,
        type: product.type,
        unit: product.unitType,
        price: product.pricePerUnit,
        quantity,
        stock: product.stock,
        image: product.productImage
      },
      seller: {
        storeName: product.sellerId.storeName,
        region: sellerAddress.region,
        telephone: sellerAddress.telephone,
        email: sellerAddress.email
      },
      deliveryTo: {
        fullName: customer.fullName,
        region: customer.region,
        province: customer.province,
        cityOrMunicipality: customer.cityOrMunicipality,
        barangay: customer.barangay,
        street: customer.street,
        telephone: customer.telephone,
        email: customer.email
      },
      summary: {
        subtotal,
        shippingFee,
        total
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to preview order", error: err.message });
  }
};

// ✅ Place order (from preview) - UPDATED FOR ITEMS ARRAY
export const createDirectOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const customer = await Customer.findOne({ userId: req.user._id, isVerified: true });
    if (!customer) return res.status(403).json({ message: "Customer must be verified" });

    const product = await Product.findById(productId);
    if (!product || product.stock < quantity)
      return res.status(400).json({ message: "Invalid or out-of-stock product" });

    const seller = await Seller.findById(product.sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const sellerAddress = await SellerAddress.findOne({ sellerId: seller._id });
    if (!sellerAddress) return res.status(404).json({ message: "Seller address missing" });

    const subtotal = quantity * product.pricePerUnit;
    const shippingFee = 50;
    const totalPrice = subtotal + shippingFee;

    const order = await Order.create({
      buyerId: customer._id,
      sellerId: seller._id,
      items: [{
        productId: product._id,
        quantity,
        priceAtOrder: product.pricePerUnit,
        itemStatus: "pending"
      }],
      totalPrice,
      deliveryAddress: {
        region: customer.region,
        province: customer.province,
        cityOrMunicipality: customer.cityOrMunicipality,
        barangay: customer.barangay,
        street: customer.street,
        postalCode: customer.postalCode,
        latitude: customer.latitude,
        longitude: customer.longitude,
        telephone: customer.telephone,
        email: customer.email
      },
      sellerAddress: {
        region: sellerAddress.region,
        province: sellerAddress.province,
        cityOrMunicipality: sellerAddress.cityOrMunicipality,
        barangay: sellerAddress.barangay,
        street: sellerAddress.street,
        postalCode: sellerAddress.postalCode,
        latitude: sellerAddress.latitude,
        longitude: sellerAddress.longitude,
        telephone: sellerAddress.telephone,
        email: sellerAddress.email
      }
    });

    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    res.status(500).json({ message: "Order placement failed", error: err.message });
  }
};

export const previewCartOrder = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id, isVerified: true });
    if (!customer) return res.status(403).json({ message: "Customer must be verified" });

    const cart = await Cart.findOne({ customerId: customer._id });
    if (!cart || cart.items.length === 0)
      return res.status(404).json({ message: "Cart is empty" });

    const previewItems = [];
    let grandTotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId).populate("sellerId");
      if (!product || product.stock < item.quantity) continue;

      const sellerAddress = await SellerAddress.findOne({ sellerId: product.sellerId._id });
      if (!sellerAddress) continue;

      const subtotal = item.quantity * product.pricePerUnit;
      const shippingFee = 50;
      const total = subtotal + shippingFee;
      grandTotal += total;

      previewItems.push({
        product: {
          name: product.productName,
          type: product.type,
          unit: product.unitType,
          price: product.pricePerUnit,
          quantity: item.quantity,
          stock: product.stock,
          image: product.productImage
        },
        seller: {
          storeName: product.sellerId.storeName,
          region: sellerAddress.region,
          telephone: sellerAddress.telephone,
          email: sellerAddress.email
        },
        summary: {
          subtotal,
          shippingFee,
          total
        }
      });
    }

    res.status(200).json({
      items: previewItems,
      deliveryTo: {
        fullName: customer.fullName,
        region: customer.region,
        province: customer.province,
        cityOrMunicipality: customer.cityOrMunicipality,
        barangay: customer.barangay,
        street: customer.street,
        telephone: customer.telephone,
        email: customer.email
      },
      grandTotal
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to preview cart order", error: err.message });
  }
};

// 🧺 Cart-based batch checkout - UPDATED FOR ITEMS ARRAY
export const checkoutCart = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id, isVerified: true });
    if (!customer) return res.status(403).json({ message: "Customer must be verified" });

    const cart = await Cart.findOne({ customerId: customer._id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Group cart items by seller
    const ordersBySeller = {};

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.durationEnd ||product.stock < item.quantity) continue;

      const seller = await Seller.findById(product.sellerId);
      if (!seller) continue;

      const sellerAddress = await SellerAddress.findOne({ sellerId: seller._id });
      if (!sellerAddress) continue;

      if (!ordersBySeller[seller._id]) {
        ordersBySeller[seller._id] = {
          seller,
          sellerAddress,
          items: [],
          subtotal: 0
        };
      }

      ordersBySeller[seller._id].items.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtOrder: product.pricePerUnit,
        itemStatus: "pending"
      });

      ordersBySeller[seller._id].subtotal += item.quantity * product.pricePerUnit;
    }

    // Create orders for each seller
    const createdOrders = [];
    for (const sellerId in ordersBySeller) {
      const { seller, sellerAddress, items, subtotal } = ordersBySeller[sellerId];
      const shippingFee = 50;
      const totalPrice = subtotal + shippingFee;

      const order = await Order.create({
        buyerId: customer._id,
        sellerId: seller._id,
        items,
        totalPrice,
        deliveryAddress: {
          region: customer.region,
          province: customer.province,
          cityOrMunicipality: customer.cityOrMunicipality,
          barangay: customer.barangay,
          street: customer.street,
          postalCode: customer.postalCode,
          latitude: customer.latitude,
          longitude: customer.longitude,
          telephone: customer.telephone,
          email: customer.email
        },
        sellerAddress: {
          region: sellerAddress.region,
          province: sellerAddress.province,
          cityOrMunicipality: sellerAddress.cityOrMunicipality,
          barangay: sellerAddress.barangay,
          street: sellerAddress.street,
          postalCode: sellerAddress.postalCode,
          latitude: sellerAddress.latitude,
          longitude: sellerAddress.longitude,
          telephone: sellerAddress.telephone,
          email: sellerAddress.email
        }
      });

      createdOrders.push(order);
    }

    // Clear cart only if all items were processed successfully
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Cart checked out", orders: createdOrders });
  } catch (err) {
    res.status(500).json({ message: "Cart checkout failed", error: err.message });
  }
};
