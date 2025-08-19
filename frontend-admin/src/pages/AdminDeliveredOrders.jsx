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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get('/api/order-to-deliver/delivered', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setDeliveries(response.data);
        setFilteredDeliveries(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchDeliveredOrders();
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

  if (filteredDeliveries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/orders/ongoing-delivery')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Back to Ongoing Deliveries
          </button>
        </div>
        <div className="max-w-6xl mx-auto text-center">
          <FaClipboardCheck className="mx-auto text-4xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Delivered Orders</h2>
          <p className="text-gray-500">{searchTerm ? 'No matches found' : 'No orders have been marked as delivered yet.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Delivered Orders</h1>

        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/orders/ongoing-delivery')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View Delivery Submission
          </button>
        </div>

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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-2">Order Code</div>
            <div className="col-span-3">Rider</div>
            <div className="col-span-3">Buyer</div>
            <div className="col-span-2">Delivered At</div>
            <div className="col-span-2">Actions</div>
          </div>

          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => handleDeliveryClick(delivery._id)}
            >
              <div className="col-span-2 font-medium text-blue-600">
                {delivery.orderCode}
              </div>
              <div className="col-span-3">
                {delivery.riderName}
              </div>
              <div className="col-span-3 text-gray-600">
                {delivery.buyerName}
              </div>
              <div className="col-span-2 text-green-700">
                {new Date(delivery.deliveredAt).toLocaleString()}
              </div>
              <div className="col-span-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
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
      </div>
    </div>
  );
};

export default AdminDeliveredOrders;