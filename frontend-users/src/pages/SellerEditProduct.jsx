import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SellerEditProduct = () => {
  const { productId } = useParams();
  const [formData, setFormData] = useState({
    productName: "",
    pricePerUnit: "",
    stock: "",
    type: "",
    unitType: "",
    uploadDuration: ""
  });

  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/api/products/seller/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = res.data.product;
        setFormData({
          productName: p.productName,
          pricePerUnit: p.pricePerUnit,
          stock: p.stock,
          type: p.type,
          unitType: p.unitType,
          uploadDuration: p.uploadDuration
        });
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axiosInstance.put(`/api/products/seller/${productId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/seller-product/${productId}`);
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  if (statusCode === 404) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-400 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">Product Not Found</h2>
          <p className="text-gray-700 mb-4">This product may have been deleted.</p>
          <button
            onClick={() => navigate("/seller-products")}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-100 flex items-center justify-center text-sky-900 text-lg">
        Loading product info...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-6">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-md p-6 border border-sky-900">
        <h2 className="text-2xl font-bold text-lime-900 mb-4 text-center">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="Product Name" required className="input" />

          <input type="number" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleChange} placeholder="Price Per Unit (₱)" required className="input ml-2" />

          <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Available Stock" required className="input" />

          <select name="type" value={formData.type} onChange={handleChange} className="input cursor-pointer ml-2">
            <option>Fresh Produce</option>
            <option>Grains & Seeds</option>
            <option>Fertilizers</option>
            <option>Agri Chemicals</option>
            <option>Animal Feed</option>
            <option>Tools & Equipment</option>
            <option>Nursery Plants</option>
            <option>Compost & Soil</option>
          </select>

          <select name="unitType" value={formData.unitType} onChange={handleChange} className="input cursor-pointer ml-2">
            <option>kg</option>
            <option>liter</option>
            <option>pcs</option>
            <option>box</option>
            <option>bag</option>
            <option>pack</option>
            <option>set</option>
          </select>

          <input type="number" name="uploadDuration" value={formData.uploadDuration} onChange={handleChange} placeholder="Duration (days)" required className="input" />

          <button type="submit" className="mt-4 w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition">
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => navigate(`/seller-product/${productId}`)}
            className="w-full py-2 mt-2 bg-lime-200 text-lime-900 rounded-lg hover:bg-lime-200/50 cursor-pointer transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerEditProduct;