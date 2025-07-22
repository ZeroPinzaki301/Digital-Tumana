import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const OrderRequestsPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/orders/seller/pending", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Failed to fetch orders:", err.message);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-orange-300">
        <h2 className="text-2xl font-bold text-orange-800 mb-6 text-center">Order Requests</h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-600">No pending orders.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="mb-6 border-b pb-4 text-sm text-gray-700">
              <h3 className="text-lg font-semibold text-orange-800">{order.productId?.productName}</h3>
              <p>Quantity: {order.quantity}</p>
              <p>Total: ₱{order.totalPrice}</p>
              <p>Buyer: {order.buyerId?.fullName}</p>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => navigate(`/order-request-summary/${order._id}`)}
                  className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  View Summary
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderRequestsPage;