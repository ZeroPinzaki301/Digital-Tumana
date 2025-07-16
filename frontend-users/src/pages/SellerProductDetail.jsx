import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SellerProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/api/products/seller/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(res.data.product);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/products/seller/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/seller-products");
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  if (statusCode === 404 || !product) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-400 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">Product Not Found</h2>
          <p className="text-gray-700 mb-4">This product may have been deleted or never existed.</p>
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

  return (
    <div className="min-h-screen bg-emerald-50 px-4 py-6 flex justify-center">
      <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-md border border-sky-900">
        {/* Top Controls */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => navigate("/seller-products")}
            className="py-2 px-4 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition"
          >
            ⬅ Back to Products
          </button>
          <div className="space-x-3">
            <button
              onClick={() => navigate(`/seller-edit-product/${product._id}`)}
              className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Product Content */}
        <div className="text-center">
          <img
            src={product.productImage}
            alt={product.productName}
            className="w-full max-w-md mx-auto rounded-lg object-cover mb-4"
          />
          <h2 className="text-2xl font-bold text-sky-900 mb-2">{product.productName}</h2>
          <p className="text-sm text-gray-700 mb-6">
            <strong>₱{product.pricePerUnit}</strong> / {product.unitType} | <strong>Stock:</strong> {product.stock}
          </p>

          <div className="text-left text-sm space-y-2 text-gray-800">
            <p><strong>Type:</strong> {product.type}</p>
            <p><strong>Upload Duration:</strong> {product.uploadDuration} days</p>
            <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>

          {product.extraImages?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Extra Images:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.extraImages.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Extra ${index + 1}`}
                    className="rounded-lg object-cover h-36 w-full border border-gray-300"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProductDetail;