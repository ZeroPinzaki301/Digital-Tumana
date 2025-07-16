import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/api/products");
        const shuffled = res.data.products.sort(() => Math.random() - 0.5); // Randomize order
        setProducts(shuffled);
      } catch (err) {
        console.error("Failed to load marketplace products:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-6">
      <h2 className="text-2xl font-bold text-center text-orange-800 mb-6">🛒 Marketplace</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-orange-300 rounded-lg shadow hover:shadow-md transition duration-200 overflow-hidden"
          >
            <img
              src={product.productImage}
              alt={product.productName}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-1">
              <h3 className="text-lg font-bold text-orange-800">{product.productName}</h3>
              <p className="text-sm text-gray-700">
                ₱{product.pricePerUnit} / {product.unitType}
              </p>
              <p className="text-xs text-gray-500">
                {product.type} • Stock: {product.stock}
              </p>
              <button
                onClick={() => navigate(`/marketplace/${product._id}`)}
                className="mt-3 w-full py-2 bg-orange-700 text-white rounded hover:bg-orange-800 transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;