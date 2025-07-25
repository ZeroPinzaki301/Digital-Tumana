import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const OrderRequestSummaryPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

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
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.patch(`/api/orders/seller/accept/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Order accepted.");
      navigate("/order-requests");
    } catch (err) {
      console.error("Accept failed:", err.message);
      alert("Could not accept order.");
    }
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/orders/seller/cancel/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Order cancelled.");
      navigate("/order-requests");
    } catch (err) {
      console.error("Cancel failed:", err.message);
      alert("Could not cancel order.");
    }
  };

  if (!order) {
    return <p className="text-center p-6 text-gray-600">Loading order details...</p>;
  }

  const { productId, quantity, totalPrice, deliveryAddress, sellerAddress, buyerId } = order;

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-orange-300">
        <h2 className="text-2xl font-bold text-orange-800 mb-6 text-center">Order Request Summary</h2>

        <img
          src={productId.productImage}
          alt={productId.productName}
          className="w-full max-w-md mx-auto mb-4 rounded border border-orange-300"
        />

        <div className="mb-4 text-sm text-gray-700">
          <p><strong>Product:</strong> {productId.productName} ({productId.type})</p>
          <p><strong>Unit:</strong> {productId.unitType}</p>
          <p><strong>Quantity:</strong> {quantity}</p>
          <p><strong>Price per Unit:</strong> ₱{productId.pricePerUnit}</p>
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
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            ❌ Cancel Order
          </button>

          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            ✅ Accept Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderRequestSummaryPage;