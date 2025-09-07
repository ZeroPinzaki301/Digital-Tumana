import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SellerAddProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    pricePerUnit: "",
    stock: "",
    type: "Fresh Produce",
    unitType: "kg",
    uploadDuration: 1 // Default to 1 day minimum
  });

  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [extraImagesPreviews, setExtraImagesPreviews] = useState([]);
  const [balanceExists, setBalanceExists] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Set min and max dates for calendar
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1); // Set minimum to tomorrow
    
    const maxDateObj = new Date();
    maxDateObj.setDate(today.getDate() + 7);
    
    setMinDate(tomorrow.toISOString().split('T')[0]);
    setMaxDate(maxDateObj.toISOString().split('T')[0]);
    
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/seller-balance/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.data) {
          setBalanceExists(true);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error checking balance:", err);
        }
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateImage = (file) => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageError("File size too large. Maximum size is 5MB.");
      return false;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setImageError("Please select an image file.");
      return false;
    }
    
    setImageError("");
    return true;
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!validateImage(file)) {
      e.target.value = ""; // Clear the input
      return;
    }
    
    setProductImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setProductImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleExtraImagesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = [];
    
    // Validate each file
    for (const file of newFiles) {
      if (validateImage(file)) {
        validFiles.push(file);
      } else {
        e.target.value = ""; // Clear the input
        return; // Stop processing if any file is invalid
      }
    }
    
    if (validFiles.length === 0) return;
    
    setExtraImages(prev => {
      const combined = [...prev, ...validFiles];
      return combined.slice(0, 5);
    });
    
    // Create previews
    const newPreviews = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setExtraImagesPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const diffTime = Math.abs(selectedDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setFormData(prev => ({ ...prev, uploadDuration: diffDays }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate images again before submitting
    if (productImage && !validateImage(productImage)) {
      return;
    }
    
    for (const file of extraImages) {
      if (!validateImage(file)) {
        return;
      }
    }
    
    const token = localStorage.getItem("token");

    const data = new FormData();
    data.append("productName", formData.productName);
    data.append("pricePerUnit", formData.pricePerUnit);
    data.append("stock", formData.stock);
    data.append("type", formData.type);
    data.append("unitType", formData.unitType);
    data.append("uploadDuration", formData.uploadDuration);

    if (productImage) data.append("productImage", productImage);
    extraImages.forEach((file) => {
      data.append("extraImages", file);
    });

    try {
      await axiosInstance.post("/api/products/seller", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/seller-products");
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  const removeProductImage = () => {
    setProductImage(null);
    setProductImagePreview(null);
    setImageError("");
  };

  const removeExtraImage = (index) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index));
    setExtraImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  if (loadingBalance) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking balance status...
      </div>
    );
  }

  if (!balanceExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50 px-4 py-6">
        <div className="max-w-md bg-white border border-yellow-400 shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-700 mb-4">
            Balance System Not Found
          </h2>
          <p className="text-gray-700 mb-4">
            You currently don't have a balance system enabled. To begin selling products, you need to activate your seller balance.
          </p>
          <button
            onClick={() => navigate("/seller-balance/create")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Setup Your Balance →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-6">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-md p-6 border border-sky-900">
        <h2 className="text-2xl font-bold text-sky-900 mb-4 text-center">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input 
              type="text" 
              name="productName" 
              value={formData.productName} 
              onChange={handleChange} 
              placeholder="e.g., Organic Tomatoes" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Unit (₱)</label>
            <input 
              type="number" 
              name="pricePerUnit" 
              value={formData.pricePerUnit} 
              onChange={handleChange} 
              placeholder="e.g., 150" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Stock</label>
            <input 
              type="number" 
              name="stock" 
              value={formData.stock} 
              onChange={handleChange} 
              placeholder="e.g., 50" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option>Fresh Produce</option>
              <option>Grains & Seeds</option>
              <option>Fertilizers</option>
              <option>Agri Chemicals</option>
              <option>Animal Feed</option>
              <option>Tools & Equipment</option>
              <option>Nursery Plants</option>
              <option>Compost & Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
            <select 
              name="unitType" 
              value={formData.unitType} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option>kg</option>
              <option>liter</option>
              <option>pcs</option>
              <option>box</option>
              <option>bag</option>
              <option>pack</option>
              <option>set</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Duration: {formData.uploadDuration} day(s)
            </label>
            <input 
              type="date" 
              min={minDate}
              max={maxDate}
              onChange={handleDateChange} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" 
            />
            <p className="text-xs text-gray-500 mt-1">
              Select an end date for your listing (1-7 days from today)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (required)</label>
            <label className="block w-full py-2 px-4 bg-sky-600 text-white text-center rounded-md cursor-pointer hover:bg-sky-700 transition">
              Choose Product Image
              <input 
                type="file" 
                name="productImage" 
                onChange={handleProductImageChange} 
                required 
                className="hidden" 
                accept="image/*"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
            
            {imageError && (
              <p className="text-red-500 text-sm mt-1">{imageError}</p>
            )}
            
            {productImagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <div className="relative inline-block">
                  <img 
                    src={productImagePreview} 
                    alt="Product preview" 
                    className="w-32 h-32 object-cover border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeProductImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Images (max 5)</label>
            <label className={`block w-full py-2 px-4 ${extraImages.length >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 cursor-pointer'} text-white text-center rounded-md transition`}>
              {extraImages.length >= 5 ? 'Maximum reached' : 'Add Extra Images'}
              <input
                type="file"
                name="extraImages"
                onChange={handleExtraImagesChange}
                multiple
                disabled={extraImages.length >= 5}
                className="hidden"
                accept="image/*"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">Max 5 images, 5MB each</p>
            
            {extraImagesPreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Extra images ({extraImagesPreviews.length}/5):</p>
                <div className="flex flex-wrap gap-2">
                  {extraImagesPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Extra preview ${index + 1}`} 
                        className="w-24 h-24 object-cover border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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