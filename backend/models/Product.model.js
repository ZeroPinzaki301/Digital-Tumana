import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },

  productName: { type: String, required: true, trim: true },
  pricePerUnit: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },

  type: {
    type: String,
    enum: [
      "Fresh Produce",    
      "Grains & Seeds",     
      "Fertilizers",       
      "Agri Chemicals",     
      "Animal Feed",       
      "Tools & Equipment",   
      "Nursery Plants",      
      "Compost & Soil"       
    ],
    required: true
  },

  unitType: {
    type: String,
    enum: ["kg", "liter", "pcs", "box", "bag", "pack", "set"],
    required: true
  },

  uploadDuration: { type: Number, required: true }, // in days
  
  durationEnd: { type: Boolean, default: false },

  productImage: { type: String, required: true }, // 🔒 preserved for order history

  extraImages: {
    type: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
    validate: {
      validator: arr => arr.length <= 5,
      message: "Maximum of 5 extra images allowed"
    }
  }

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;