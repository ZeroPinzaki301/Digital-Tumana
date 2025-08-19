import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import {
  FaBoxOpen,
  FaUserTie,
  FaMoneyBillWave,
  FaTruck,
  FaImage
} from "react-icons/fa";

const AdminPendingPaymentOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axiosInstance.get(
          `/api/admin/seller-balance/pending-payment/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setOrderDetails(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!orderDetails)
    return <div className="text-center py-10 text-gray-500">No data found.</div>;

  const subtotal = orderDetails.items.reduce(
    (acc, item) => acc + item.priceAtOrder * item.quantity,
    0
  );
  const shippingFee = 50;
  const grandTotal = subtotal + shippingFee;

  const handleMarkAsPaid = async () => {
    const confirm = window.confirm(
      "Are you sure you want to mark this order as paid and update the seller's balance?"
    );
    if (!confirm) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.patch(
        "/api/admin/seller-balance/update",
        {
          sellerId: orderDetails.sellerId,
          totalPrice: grandTotal,
          orderCode: orderDetails.orderCode
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShowSuccessOverlay(true);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "❌ Failed to update seller's balance. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {/* ✅ Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              ✅ Update Successful!
            </h2>
            <p className="text-gray-700 mb-6">
              Seller's balance has been updated.
            </p>
            <button
              onClick={() => navigate("/admin/pending-payment-orders")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Go to Pending Payment Orders
            </button>
          </div>
        </div>
      )}

      {/* ✅ Main Content */}
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md mt-6 pointer-events-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Pending Payment Order Details
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <FaBoxOpen className="text-blue-500" />
            <span>
              <strong>Order ID:</strong> {orderDetails.orderId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <FaUserTie className="text-purple-500" />
            <span>
              <strong>Seller ID:</strong> {orderDetails.sellerId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <FaTruck className="text-orange-500" />
            <span>
              <strong>Rider ID:</strong>{" "}
              {orderDetails.riderId.name || orderDetails.riderId._id}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <FaBoxOpen className="text-indigo-500" />
            <span>
              <strong>Order Code:</strong> {orderDetails.orderCode}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Items</h3>
            <ul className="list-disc list-inside text-gray-700">
              {orderDetails.items.map((item, index) => (
                <li key={index}>
                  Product ID: {item.productId} | Quantity: {item.quantity} | Price: ₱
                  {item.priceAtOrder.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          {orderDetails.deliveryProof && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Delivery Proof
              </h3>
              <img
                src={orderDetails.deliveryProof}
                alt="Delivery Proof"
                className="w-full max-w-md rounded-md border"
              />
            </div>
          )}
        </div>

        <div className="mt-8 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Price Breakdown
          </h3>
          <div className="text-gray-700 space-y-1">
            <p>
              <strong>Subtotal (Items):</strong> ₱{subtotal.toFixed(2)}
            </p>
            <p>
              <strong>Shipping Fee:</strong> ₱{shippingFee.toFixed(2)}
            </p>
            <p className="text-xl font-bold text-gray-900 mt-2">
              <strong>Total Price:</strong> ₱{grandTotal.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow ${
              isUpdating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleMarkAsPaid}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Mark as Paid"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPendingPaymentOrderDetails;