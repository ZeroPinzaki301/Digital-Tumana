import Product from "../models/Product.model.js";
import Seller from "../models/Seller.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import cron from "node-cron";

// 🔧 Utility: Check and mark expired products
const checkProductExpiration = async (product) => {
  const expiryDate = new Date(product.createdAt.getTime() + product.uploadDuration * 86400000);
  if (product.stock <= 0 || Date.now() > expiryDate.getTime()) {
    product.durationEnd = true;

    for (const img of product.extraImages) {
      await deleteFromCloudinary(img.publicId);
    }

    product.extraImages = [];
    await product.save();

    console.log(`🧼 Expired: ${product.productName}`);
  }
};

// 📌 1. Create product
export const createProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const seller = await Seller.findOne({ userId });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const {
      productName,
      pricePerUnit,
      stock,
      type,
      unitType,
      uploadDuration
    } = req.body;

    if (!req.files?.productImage) {
      return res.status(400).json({ message: "Main product image is required" });
    }

    const productImageRes = await uploadToCloudinary(
      req.files.productImage[0].path,
      "product_images"
    );

    const extraImages = [];
    if (req.files?.extraImages) {
      for (const file of req.files.extraImages) {
        const result = await uploadToCloudinary(file.path, "product_images");
        extraImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const newProduct = await Product.create({
      sellerId: seller._id,
      productName,
      pricePerUnit,
      stock,
      type,
      unitType,
      uploadDuration,
      productImage: productImageRes.secure_url,
      extraImages,
      durationEnd: false
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

// 📌 2. Get seller products with durationEnd === false
export const getSellerProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const seller = await Seller.findOne({ userId });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const activeProducts = await Product.find({
      sellerId: seller._id,
      durationEnd: false
    });

    res.status(200).json({ products: activeProducts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// 📌 3. Get single product (and check expiration)
export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await checkProductExpiration(product);
    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Failed to get product", error: err.message });
  }
};

// 📌 4. Update product details
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, updates);
    await product.save();

    await checkProductExpiration(product);
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

// 📌 5. Delete product and extra images
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    for (const img of product.extraImages) {
      await deleteFromCloudinary(img.publicId);
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};

// 🌙 Cron Job: Daily expiration check
cron.schedule("0 0 * * *", async () => {
  console.log("🌙 Running daily product expiration check...");
  const products = await Product.find({ durationEnd: false });

  for (const product of products) {
    await checkProductExpiration(product);
  }
});