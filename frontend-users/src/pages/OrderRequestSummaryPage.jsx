import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const OrderRequestSummaryPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info", // info, success, error
    onConfirm: null,
    showCancelButton: false
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/api/orders/seller/summary/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(res.data.order);
      } catch (err) {
        console.error("Failed to fetch order summary:", err.message);
        showModal("Error", "Failed to load order details. Please try again.", "error");
      }
    };
    fetchOrder();
  }, [orderId]);

  const showModal = (title, message, type = "info", onConfirm = null, showCancelButton = false) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      showCancelButton
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
      showCancelButton: false
    });
  };

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem("token");

      const acceptResponse = await axiosInstance.patch(
        `/api/orders/seller/accept/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      try {
        const trackingResponse = await axiosInstance.post(
          "/api/order-tracking",
          { orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        navigate(`/seller-ongoing-order/${orderId}`, {
          state: {
            order: acceptResponse.data.order,
            orderTracking: trackingResponse.data.orderTracking
          }
        });
      } catch (trackingError) {
        console.error("Tracking creation failed:", trackingError);
        navigate("/order-confirmation", {
          state: {
            order: acceptResponse.data.order,
            trackingError: true
          }
        });
      }
    } catch (acceptError) {
      console.error("Order acceptance failed:", acceptError);
      showModal(
        "Order Acceptance Failed", 
        acceptError.response?.data?.message || acceptError.message, 
        "error"
      );
    }
  };

  const handleCancel = () => {
    showModal(
      "Confirm Cancellation",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      "error",
      confirmCancel,
      true
    );
  };

  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/orders/seller/cancel/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showModal(
        "Order Cancelled", 
        "The order has been successfully cancelled.", 
        "success",
        () => navigate("/order-requests")
      );
    } catch (err) {
      console.error("Cancel failed:", err.message);
      showModal(
        "Cancellation Failed", 
        "Could not cancel the order. Please try again.", 
        "error"
      );
    }
  };

  if (!order) {
    return <p className="text-center p-6 text-gray-600">Loading order details...</p>;
  }

  const currentItem = order.items[selectedItemIndex];
  const { productId, quantity, priceAtOrder } = currentItem;
  const { deliveryAddress, sellerAddress, buyerId, totalPrice } = order;

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      {/* Modal Component */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className={`p-4 ${modal.type === "error" ? "bg-red-500" : modal.type === "success" ? "bg-green-500" : "bg-orange-500"} text-white`}>
              <h3 className="text-xl font-bold">{modal.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">{modal.message}</p>
              <div className="flex justify-end space-x-3">
                {modal.showCancelButton && (
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (modal.onConfirm) modal.onConfirm();
                    closeModal();
                  }}
                  className={`px-4 py-2 rounded text-white ${modal.type === "error" ? "bg-red-500 hover:bg-red-600" : modal.type === "success" ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"} transition`}
                >
                  {modal.type === "error" && modal.showCancelButton ? "Confirm" : "OK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-orange-300">
        <h2 className="text-2xl font-bold text-orange-800 mb-6 text-center">Order Request Summary</h2>

        {order.items.length > 1 && (
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setSelectedItemIndex(prev => Math.max(0, prev - 1))}
              disabled={selectedItemIndex === 0}
              className="px-3 py-1 bg-orange-200 rounded disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span>Item {selectedItemIndex + 1} of {order.items.length}</span>
            <button
              onClick={() => setSelectedItemIndex(prev => Math.min(order.items.length - 1, prev + 1))}
              disabled={selectedItemIndex === order.items.length - 1}
              className="px-3 py-1 bg-orange-200 rounded disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        <img
          src={productId.productImage}
          alt={productId.productName}
          className="w-full max-w-md mx-auto mb-4 rounded border border-orange-300"
        />

        <div className="mb-4 text-sm text-gray-700">
          <p><strong>Product:</strong> {productId.productName} ({productId.type})</p>
          <p><strong>Unit:</strong> {productId.unitType}</p>
          <p><strong>Quantity:</strong> {quantity}</p>
          <p><strong>Price per Unit:</strong> ₱{priceAtOrder}</p>
          <p><strong>Item Status:</strong> {currentItem.itemStatus}</p>
        </div>

        <div className="mb-4 text-sm text-gray-700">
          <h3 className="font-semibold text-orange-700 mb-2">Customer Delivery Address</h3>
          <p>{buyerId?.fullName}</p>
          <p>{deliveryAddress.street}, {deliveryAddress.barangay}, {deliveryAddress.cityOrMunicipality}</p>
          <p>{deliveryAddress.province}, {deliveryAddress.region}</p>
          <p>Tel: {deliveryAddress.telephone}</p>
          <p>Email: {deliveryAddress.email}</p>
        </div>

        <div className="mb-4 text-sm text-gray-700">
          <h3 className="font-semibold text-orange-700 mb-2">Seller Address Snapshot</h3>
          <p>{sellerAddress.street}, {sellerAddress.barangay}, {sellerAddress.cityOrMunicipality}</p>
          <p>{sellerAddress.province}, {sellerAddress.region}</p>
          <p>Tel: {sellerAddress.telephone}</p>
          <p>Email: {sellerAddress.email}</p>
        </div>

        <div className="bg-orange-100 p-4 rounded-lg text-gray-900 font-bold mb-4 text-center">
          <p>Total Price: ₱{totalPrice}</p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
          >
            Cancel Order
          </button>

          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer"
          >
            Accept Order
          </button>
        </div>

        {/* Back to Order Requests Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/order-requests")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition cursor-pointer"
          >
            ← Back to Order Requests
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderRequestSummaryPage;