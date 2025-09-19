import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const MarketplaceProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [customerStatus, setCustomerStatus] = useState("loading");
  const [showCartModal, setShowCartModal] = useState(false);
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

  const handleAddToCart = async () => {
    try {
      await axiosInstance.post("/api/carts/add", {
        productId: product._id,
        quantity: product.selectedQty,
        stockLimit: product.stock
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setShowCartModal(true);
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  if (statusCode === 404 || !product) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-lime-900 text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-red-700 mb-2">Product Not Found</h2>
          <p className="text-gray-700 mb-4">This product may have expired or is no longer available.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition cursor-pointer"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const seller = product.sellerId;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 flex justify-center">
      {/* Cart Success Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-lime-900 max-w-sm w-full">
            <div className="text-center">
              <svg 
                className="w-16 h-16 text-lime-600 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <h3 className="text-xl font-bold text-lime-800 mb-2">Added to Cart!</h3>
              <p className="text-gray-700 mb-6">
                {product.selectedQty} {product.unitType}(s) of {product.productName} has been added to your cart.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/my-cart")}
                  className="py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition cursor-pointer"
                >
                  View Cart
                </button>
                <button
                  onClick={() => setShowCartModal(false)}
                  className="py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-6xl p-4 sm:p-6 rounded-lg shadow-md border border-lime-900">
        <button
          onClick={() => navigate("/marketplace")}
          className="py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 mb-6 cursor-pointer"
        >
          Back to Marketplace
        </button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Product Image */}
          <div className="lg:w-1/2">
            <img
              src={product.productImage}
              alt={product.productName}
              className="w-full rounded-lg object-cover mb-4 border border-lime-900 max-h-64 sm:max-h-80 lg:max-h-[400px]"
            />
            {product.extraImages?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                {product.extraImages.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Extra ${index + 1}`}
                    className="rounded-lg object-cover h-20 sm:h-24 md:h-28 lg:h-36 w-full border border-lime-900"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details and Actions */}
          <div className="lg:w-1/2 flex flex-col justify-between mt-6 lg:mt-0">
            <div>
              <h2 className="text-2xl font-bold text-lime-800">{product.productName}</h2>
              <p className="text-sm text-gray-700 mb-4">
                ₱{product.pricePerUnit} / {product.unitType} • Stock: {product.stock}
              </p>
              <div className="text-sm space-y-2 text-gray-800">
                <p><strong>Type:</strong> {product.type}</p>
                <p><strong>Upload Duration:</strong> {product.uploadDuration} days</p>
                <p><strong>Listed On:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="mt-6 p-4 bg-lime-50 rounded-lg border border-lime-900 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <img
                  src={seller.storePicture || "/default-avatar.png"}
                  alt={seller.storeName}
                  className="h-16 w-16 object-cover rounded-full border border-lime-900"
                />
                <div>
                  <p className="text-sm text-gray-600">Sold by</p>
                  <h3 className="text-lg font-semibold text-lime-800">{seller.storeName}</h3>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8">
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
                    className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700 transition cursor-pointer"
                  >
                    Register as Customer
                  </button>
                </div>
              )}
              {customerStatus === "pending" && (
                <div className="text-center text-sm text-yellow-700 font-semibold mb-6">
                  Your customer registration is under review.
                </div>
              )}
              {customerStatus === "verified" && (
                <>
                  <h4 className="text-lg font-semibold text-lime-700 mb-3 text-center sm:text-left">Select Quantity</h4>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                    <button
                      onClick={() =>
                        setProduct((prev) => ({
                          ...prev,
                          selectedQty: Math.max(1, prev.selectedQty - 1)
                        }))
                      }
                      className="px-3 py-1 bg-lime-200 text-lime-900 rounded hover:bg-lime-300 transition cursor-pointer"
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
                      className="px-3 py-1 bg-lime-200 text-lime-900 rounded hover:bg-lime-300 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() =>
                        navigate(`/order-preview/${product._id}?quantity=${product.selectedQty}`)
                      }
                      className="py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition cursor-pointer"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceProductDetail;
