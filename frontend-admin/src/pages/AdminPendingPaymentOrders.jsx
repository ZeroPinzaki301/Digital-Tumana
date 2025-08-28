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
  const [counts, setCounts] = useState({
    confirmed: 0,
    shipped: 0,
    ongoing: 0,
    delivered: 0,
    pending: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        
        // Fetch pending payments (main data for this page)
        const pendingResponse = await axiosInstance.get("/api/admin/seller-balance/pending-payment", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (pendingResponse.data.success) {
          setOrders(pendingResponse.data.data);
          setFilteredOrders(pendingResponse.data.data);
        }

        // Fetch counts for all status buttons
        const [confirmedRes, shippedRes, ongoingRes, deliveredRes] = await Promise.all([
          axiosInstance.get('/api/order-tracking/admin/confirmed', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { orders: [] } })),
          axiosInstance.get('/api/order-tracking/admin/shipped', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { orders: [] } })),
          axiosInstance.get('/api/order-to-deliver/undelivered', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: [] } })),
          axiosInstance.get('/api/order-to-deliver/delivered', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: [] })),
        ]);

        setCounts({
          confirmed: confirmedRes.data.orders?.length || 0,
          shipped: shippedRes.data.orders?.length || 0,
          ongoing: ongoingRes.data.data?.length || 0,
          delivered: deliveredRes.data?.length || 0,
          pending: pendingResponse.data.data?.length || 0,
        });

      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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

  const handleStatusRedirect = (statusKey) => {
    const routes = {
      confirmed: '/admin-ongoing-orders',
      shipped: '/admin-shipped-orders',
      ongoing: '/admin/orders/ongoing-delivery',
      delivered: '/admin/orders/delivered',
      pending: '/admin/pending-payment-orders',
    };
    navigate(routes[statusKey]);
  };

  const renderStatusButtons = () => {
    const buttons = [
      { label: 'Confirmed Orders', key: 'confirmed' },
      { label: 'Shipped Orders', key: 'shipped' },
      { label: 'Ongoing Deliveries', key: 'ongoing' },
      { label: 'Delivered', key: 'delivered' },
      { label: 'Pending Payments', key: 'pending' },
    ];

    return (
      <div className="flex space-x-4 mb-6">
        {buttons.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => handleStatusRedirect(key)}
            className="relative px-4 py-2 bg-sky-500 text-white rounded hover:bg-blue-300 hover:text-sky-800 cursor-pointer transition"
          >
            {label}
            {counts[key] > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>
    );
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
          
          {renderStatusButtons()}

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
        
        {renderStatusButtons()}

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