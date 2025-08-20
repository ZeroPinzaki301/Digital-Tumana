import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

export default function AllSellerOngoingOrders() {
  const navigate = useNavigate();
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOngoingOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/api/order-tracking/seller/ongoing', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // Ensure we always have an array, even if empty
          setOngoingOrders(response.data.ongoingOrders || []);
        } else {
          setError(response.data.message || 'No ongoing orders found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch ongoing orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingOrders();
  }, []);

  // Debugging - log the data we received
  useEffect(() => {
    console.log('Ongoing orders data:', ongoingOrders);
  }, [ongoingOrders]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
        <p className="text-orange-700">Loading ongoing orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-4">Error</h2>
          <p className="text-orange-600">{error}</p>
        </div>
      </div>
    );
  }

  if (ongoingOrders.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-4">No Ongoing Orders</h2>
          <p className="text-orange-600">You have no active orders at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/seller-dashboard')}
        className="mb-6 px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800 transition cursor-pointer"
      >
        ← Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold text-lime-900 mb-6 text-center">Ongoing Seller Orders</h1>
      <div className="grid gap-4">
        {ongoingOrders.map((order) => (
          <div
            key={order._id}
            className="p-4 bg-white rounded-lg shadow-md border border-orange-200 cursor-pointer hover:shadow-lg"
            onClick={() => navigate(`/seller-ongoing-order/${order.orderId}`)}
          >
            <p className="text-sm text-lime-900">
              Tracking Code: <strong>{order.orderCode}</strong>
            </p>
            <p className="text-sm">Order ID: {order.orderId}</p>
            <p className="text-sm">Status: {order.status}</p>
            <p className={`text-sm font-semibold ${
              order.paymentStatus === 'Paid' ? 'text-lime-900' : 'text-lime-900/75'
            }`}>
              Payment: {order.paymentStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}