import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaSearch, FaBoxOpen } from 'react-icons/fa';

const AdminShippedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
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
    const token = localStorage.getItem('adminToken');

    const fetchAllCounts = async () => {
      try {
        const [confirmedRes, shippedRes, ongoingRes, deliveredRes, pendingRes] = await Promise.all([
          axiosInstance.get('/api/order-tracking/admin/confirmed', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get('/api/order-tracking/admin/shipped', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get('/api/order-to-deliver/undelivered', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: [] } })),
          axiosInstance.get('/api/order-to-deliver/delivered', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get('/api/admin/seller-balance/pending-payment', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: [] } })),
        ]);

        setOrders(shippedRes.data.orders);
        setFilteredOrders(shippedRes.data.orders);
        setCounts({
          confirmed: confirmedRes.data.orders?.length || 0,
          shipped: shippedRes.data.orders?.length || 0,
          ongoing: ongoingRes.data.data?.length || 0,
          delivered: deliveredRes.data?.length || 0,
          pending: pendingRes.data.data?.length || 0,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shipped orders:', error);
        setError(error.response?.data?.message || 'Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchAllCounts();
  }, []);

  useEffect(() => {
    const results = orders.filter(order =>
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderId?.buyerId &&
        order.orderId.buyerId.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrders(results);
  }, [searchTerm, orders]);

  const handleOrderClick = (orderId) => {
    navigate(`/admin/shipped-orders/${orderId}`);
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
      <div className="min-h-screen p-6 bg-gray-50 flex justify-center items-center">
        <p className="text-gray-700">Loading shipped orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Orders</h2>
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

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shipped Orders</h1>

        {renderStatusButtons()}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order code, ID, or buyer name..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaBoxOpen className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Shipped Orders Found</h2>
            <p className="text-gray-500">
              {searchTerm ? 'No matches for your search' : 'There are currently no shipped orders'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
              <div className="col-span-2">Order Code</div>
              <div className="col-span-3">Buyer</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Items</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1">Actions</div>
            </div>

            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOrderClick(order.orderId._id)}
              >
                <div className="col-span-2 font-medium text-blue-600">{order.orderCode}</div>
                <div className="col-span-3">{order.orderId?.buyerId?.fullName || 'N/A'}</div>
                <div className="col-span-2">{new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="col-span-2">
                  {order.orderId?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                </div>
                <div className="col-span-2 font-medium">
                  ₱{order.orderId?.totalPrice?.toFixed(2) || '0.00'}
                </div>
                <div className="col-span-1">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrderClick(order.orderId._id);
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShippedOrders;
