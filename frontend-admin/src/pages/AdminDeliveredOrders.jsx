import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaSearch, FaClipboardCheck } from 'react-icons/fa';

const AdminDeliveredOrders = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
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

        setDeliveries(deliveredRes.data);
        setFilteredDeliveries(deliveredRes.data);

        setCounts({
          confirmed: confirmedRes.data.orders?.length || 0,
          shipped: shippedRes.data.orders?.length || 0,
          ongoing: ongoingRes.data.data?.length || 0,
          delivered: deliveredRes.data?.length || 0,
          pending: pendingRes.data.data?.length || 0,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchAllCounts();
  }, []);

  useEffect(() => {
    const results = deliveries.filter(delivery =>
      delivery.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.riderName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeliveries(results);
  }, [searchTerm, deliveries]);

  const handleDeliveryClick = (deliveryId) => {
    navigate(`/admin/delivered/${deliveryId}`);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Loading completed deliveries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Delivered Orders</h1>

        {renderStatusButtons()}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order code, buyer, or rider..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div className="max-w-6xl mx-auto text-center">
            <FaClipboardCheck className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Delivered Orders</h2>
            <p className="text-gray-500">
              {searchTerm ? 'No matches found' : 'No orders have been marked as delivered yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
              <div className="col-span-2">Order Code</div>
              <div className="col-span-3">Rider</div>
              <div className="col-span-3">Buyer</div>
              <div className="col-span-3">Delivered At</div>
              <div className="col-span-1">Actions</div>
            </div>

            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleDeliveryClick(delivery._id)}
              >
                <div className="col-span-2 font-medium text-blue-600">{delivery.orderCode}</div>
                <div className="col-span-3">{delivery.riderName}</div>
                <div className="col-span-3 text-gray-600">{delivery.buyerName}</div>
                <div className="col-span-3 text-green-700">
                  {new Date(delivery.deliveredAt).toLocaleString()}
                </div>
                <div className="col-span-1">
                  <button
                    className="text-sky-800 rounded hover:text-sky-600 cursor-pointer text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeliveryClick(delivery._id);
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

export default AdminDeliveredOrders;
