import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const MarketplaceProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [customerStatus, setCustomerStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/api/products/${productId}`);
        setProduct({ ...res.data.product, selectedQty: 1 });
        setStatusCode(null);
      } catch (err) {
        setStatusCode(err.response?.status || 500);
      }
    };

    const checkCustomerStatus = async () => {
      try {
        const res = await axiosInstance.get("/api/customers/dashboard", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.status === 200) setCustomerStatus("verified");
      } catch (err) {
        if (err.response?.status === 403) setCustomerStatus("pending");
        else if (err.response?.status === 404) setCustomerStatus("unregistered");
      }
    };

    fetchProduct();
    checkCustomerStatus();
  }, [productId]);

  if (statusCode === 404 || !product) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-400 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">Product Not Found</h2>
          <p className="text-gray-700 mb-4">This product may have expired or is no longer available.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const seller = product.sellerId;

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-6 flex justify-center">
      <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-md border border-orange-400">
        {/* ⬅ Back */}
        <button
          onClick={() => navigate("/marketplace")}
          className="py-2 px-4 bg-orange-700 text-white rounded hover:bg-orange-800 mb-6"
        >
          ⬅ Back to Marketplace
        </button>

        {/* 📦 Product */}
        <div className="text-center">
          <img
            src={product.productImage}
            alt={product.productName}
            className="w-full max-w-md mx-auto rounded-lg object-cover mb-4 border border-orange-300"
          />
          {product.extraImages?.length > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.extraImages.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`Extra ${index + 1}`}
                  className="rounded-lg object-cover h-36 w-full border border-orange-300"
                />
              ))}
            </div>
          )}
          <h2 className="text-2xl font-bold text-orange-800 mt-4">{product.productName}</h2>
          <p className="text-sm text-gray-700 mb-4">
            ₱{product.pricePerUnit} / {product.unitType} • Stock: {product.stock}
          </p>

          <div className="text-left text-sm space-y-2 text-gray-800">
            <p><strong>Type:</strong> {product.type}</p>
            <p><strong>Upload Duration:</strong> {product.uploadDuration} days</p>
            <p><strong>Listed On:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* 🧺 Cart Actions */}
        <div className="mt-10 border-t pt-6 border-orange-300">
          <h4 className="text-lg font-semibold text-orange-700 mb-3">Select Quantity</h4>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() =>
                setProduct((prev) => ({
                  ...prev,
                  selectedQty: Math.max(1, prev.selectedQty - 1)
                }))
              }
              className="px-3 py-1 bg-orange-200 text-orange-900 rounded hover:bg-orange-300 transition"
            >
              −
            </button>
            <span className="text-xl font-bold">{product.selectedQty}</span>
            <button
              onClick={() =>
                setProduct((prev) => ({
                  ...prev,
                  selectedQty: Math.min(prev.stock, prev.selectedQty + 1)
                }))
              }
              className="px-3 py-1 bg-orange-200 text-orange-900 rounded hover:bg-orange-300 transition"
            >
              +
            </button>
          </div>

          {/* 🛑 Conditional status message */}
          {customerStatus === "loading" && (
            <p className="text-sm text-gray-600 text-center">Checking customer status...</p>
          )}

          {customerStatus === "unregistered" && (
            <div className="text-center mb-6">
              <p className="text-sm text-red-700 font-semibold mb-2">
                You must register as a customer to place orders.
              </p>
              <button
                onClick={() => navigate("/customer/register")}
                className="px-4 py-2 bg-orange-700 text-white rounded hover:bg-orange-800 transition"
              >
                📝 Register as Customer
              </button>
            </div>
          )}

          {customerStatus === "pending" && (
            <div className="text-center text-sm text-yellow-700 font-semibold mb-6">
              Your customer registration is under review. Please wait for verification.
            </div>
          )}

          {customerStatus === "verified" && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  navigate(`/order-preview/${product._id}?quantity=${product.selectedQty}`)
                }
                className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                🛍 Buy Now
              </button>

              <button
                onClick={async () => {
                  try {
                    await axiosInstance.post("/api/carts/add", {
                      productId: product._id,
                      quantity: product.selectedQty,
                      stockLimit: product.stock
                    }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    });
                    alert("Added to cart!");
                  } catch (err) {
                    console.error("Add to cart failed:", err);
                  }
                }}
                className="py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                ➕ Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* 🧑‍🌾 Seller Info */}
        <div className="mt-8 p-4 bg-orange-100 rounded-lg border border-orange-300 flex items-center gap-4">
          <img
            src={seller.storePicture || "/default-avatar.png"}
            alt={seller.storeName}
            className="h-16 w-16 object-cover rounded-full border border-orange-400"
          />
          <div>
            <p className="text-sm text-gray-600">Sold by</p>
            <h3 className="text-lg font-semibold text-orange-800">{seller.storeName}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceProductDetail;