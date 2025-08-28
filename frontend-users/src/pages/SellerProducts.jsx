import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/products/seller", {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }
        });
        setProducts(res.data.products);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchProducts();
  }, []);

  if (statusCode === 404 || products.length === 0) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-orange-400">
          <h2 className="text-xl font-bold text-orange-700 mb-2">No Products Yet</h2>
          <p className="text-gray-700 mb-4">You haven’t added any products yet.</p>
          <button
            onClick={() => navigate("/seller-add-product")}
            className="w-full py-2 cursor-pointer bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition"
          >
            Add Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-4 py-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/seller-dashboard")}
          className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition"
        >
          ⬅ Back to Dashboard
        </button>
        <button
          onClick={() => navigate("/seller-add-product")}
          className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition"
        >
          Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md border border-sky-800 overflow-hidden">
            <img
              src={product.productImage}
              alt={product.productName}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-xl font-bold text-lime-900">{product.productName}</h3>
              <p className="text-lime-900 text-sm">
                <strong>Price:</strong> ₱{product.pricePerUnit} / {product.unitType}
              </p>
              <p className="text-lime-900 text-sm">
                <strong>Stock:</strong> {product.stock}
              </p>
              <p className="text-lime-900 text-sm">
                <strong>Type:</strong> {product.type}
              </p>
              <p className="text-lime-900 text-sm">
                <strong>Duration:</strong> {product.uploadDuration} days
              </p>

              <button
                onClick={() => navigate(`/seller-product/${product._id}`)}
                className="mt-3 w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 hover:text-sky-900 cursor-pointer transition"
              >
                View / Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerProducts;