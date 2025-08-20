import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaSearch, FaTruck, FaArrowLeft } from 'react-icons/fa';

const RiderDeliveryHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryHistory = async () => {
      try {
        const token = localStorage.getItem('karitonToken');
        const response = await axiosInstance.get('/api/kariton/delivery-history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHistory(response.data);
        setFilteredHistory(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching delivery history:', error);
        setError(error.response?.data?.error || 'Failed to fetch delivery history');
        setLoading(false);
      }
    };

    fetchDeliveryHistory();
  }, []);

  useEffect(() => {
    const results = history.filter(entry =>
      entry.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(results);
  }, [searchTerm, history]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
        <p className="text-gray-600">Loading delivery history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
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

  if (filteredHistory.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <FaTruck className="mx-auto text-4xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Delivery History Found</h2>
          <p className="text-gray-500">
            {searchTerm ? 'No matches for your search' : 'You currently have no completed deliveries'}
          </p>
          <button
            onClick={() => navigate("/kariton-service/rider/dashboard")}
            className="mt-6 inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/kariton-service/rider/dashboard")}
          className="mb-4 inline-flex items-center px-4 py-2 cursor-pointer bg-white border border-lime-700 text-lime-700 rounded-lg shadow hover:bg-lime-100 transition"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Delivery History</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order code, ID, or customer name..."
              className="w-full pl-10 pr-4 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-lime-700 p-4 font-semibold text-white">
            <div className="col-span-3">Order Code</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-3">Status</div>
          </div>

          {filteredHistory.map((entry) => (
            <div
              key={entry._id}
              className="grid grid-cols-12 p-4 border-b bg-white hover:bg-gray-50"
            >
              <div className="col-span-3 font-medium text-lime-700">{entry.orderCode}</div>
              <div className="col-span-3">{entry.customerName}</div>
              <div className="col-span-3">
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
              <div className="col-span-3 text-sm text-gray-600">
                Delivered
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiderDeliveryHistory;