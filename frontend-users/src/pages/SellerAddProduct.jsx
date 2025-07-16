import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SellerAddProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    pricePerUnit: "",
    stock: "",
    type: "Fresh Produce",
    unitType: "kg",
    uploadDuration: 7
  });

  const [productImage, setProductImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleExtraImagesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setExtraImages(prev => {
      // Combine previous files with new files, then slice to keep only first 5
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 5);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = new FormData();
    data.append("productName", formData.productName);
    data.append("pricePerUnit", formData.pricePerUnit);
    data.append("stock", formData.stock);
    data.append("type", formData.type);
    data.append("unitType", formData.unitType);
    data.append("uploadDuration", formData.uploadDuration);

    if (productImage) data.append("productImage", productImage);
    extraImages.forEach((file, index) => {
      data.append(`extraImages`, file);
    });

    try {
      await axiosInstance.post("/api/products/seller", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/seller-products"); // go back after success
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  // Function to remove an extra image
  const removeExtraImage = (index) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-6">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-md p-6 border border-sky-900">
        <h2 className="text-2xl font-bold text-sky-900 mb-4 text-center">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="Product Name" required className="input" />

          <input type="number" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleChange} placeholder="Price Per Unit (₱)" required className="input" />

          <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Available Stock" required className="input" />

          <select name="type" value={formData.type} onChange={handleChange} className="input">
            <option>Fresh Produce</option>
            <option>Grains & Seeds</option>
            <option>Fertilizers</option>
            <option>Agri Chemicals</option>
            <option>Animal Feed</option>
            <option>Tools & Equipment</option>
            <option>Nursery Plants</option>
            <option>Compost & Soil</option>
          </select>

          <select name="unitType" value={formData.unitType} onChange={handleChange} className="input">
            <option>kg</option>
            <option>liter</option>
            <option>pcs</option>
            <option>box</option>
            <option>bag</option>
            <option>pack</option>
            <option>set</option>
          </select>

          <input type="number" name="uploadDuration" value={formData.uploadDuration} onChange={handleChange} placeholder="Duration (days)" required className="input" />

          <label className="block text-sm text-gray-700 font-semibold">Product Image (required)</label>
          <input type="file" name="productImage" onChange={handleProductImageChange} required />

          <label className="block text-sm text-gray-700 font-semibold mt-2">Extra Images (max 5)</label>
          <input 
            type="file" 
            name="extraImages" 
            onChange={handleExtraImagesChange} 
            multiple 
            disabled={extraImages.length >= 5}
          />
          {extraImages.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected extra images ({extraImages.length}/5):</p>
              <ul className="list-disc pl-5">
                {extraImages.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="truncate">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeExtraImage(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="mt-4 w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition">
            Submit Product
          </button>

          <button
            type="button"
            onClick={() => navigate("/seller-products")}
            className="w-full py-2 mt-2 bg-gray-200 text-sky-900 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerAddProduct;