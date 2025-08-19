import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaSearch, FaMoneyBillWave } from "react-icons/fa";

const AdminPendingPaymentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axiosInstance.get("/api/admin/seller-balance/pending-payment", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setOrders(response.data.data);
          setFilteredOrders(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPayments();
  }, []);

  useEffect(() => {
    const results = orders.filter(order =>
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(results);
  }, [searchTerm, orders]);

  const handleOrderClick = (orderId) => {
    navigate(`/admin/pending-payment/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
        <p className="text-gray-600">Loading pending payment orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Pending Payments</h1>

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order code or order ID..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaMoneyBillWave className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Pending Payments</h2>
            <p className="text-gray-500">
              {searchTerm ? "No matches for your search" : "All payments have been processed"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pending Payment Orders</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order code or order ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
          <div className="col-span-2">Order Code</div>
          <div className="col-span-3">Order ID</div>
          <div className="col-span-3">Seller ID</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-2">Status</div>
        </div>

        {filteredOrders.map(order => (
          <div
            key={order.trackingId}
            className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 cursor-pointer"
            onClick={() => handleOrderClick(order.orderId)}
          >
            <div className="col-span-2 text-blue-600 font-medium">
              {order.orderCode}
            </div>
            <div className="col-span-3 text-gray-800">
              {order.orderId}
            </div>
            <div className="col-span-3 text-gray-600">
              {order.sellerId}
            </div>
            <div className="col-span-2 text-green-700 font-semibold">
              ₱{order.totalPrice.toFixed(2)}
            </div>
            <div className="col-span-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                {order.status}
              </span>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPendingPaymentOrders;