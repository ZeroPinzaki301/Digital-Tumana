import Product from "../models/Product.model.js";

// 📌 1. Get all active products for marketplace browsing
export const getAvailableProducts = async (req, res) => {
  try {
    const products = await Product.find({
      durationEnd: false,
      stock: { $gt: 0 }
    }).select("-extraImages"); // Optional: hide extraImages for buyers

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// 📌 2. Get details of a single active product
export const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      durationEnd: false,
      stock: { $gt: 0 }
    }).populate({
      path: "sellerId",
      select: "storeName storePicture"
    });

    if (!product) {
      return res.status(404).json({ message: "Product not available or expired" });
    }

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};