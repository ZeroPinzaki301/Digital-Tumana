import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

export default function SellerOngoingOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderTracking, setOrderTracking] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(
          `/api/order-tracking/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setOrderTracking(response.data.orderTracking);
          setOrderStatus(response.data.orderStatus);
        } else {
          setError('Tracking information not found');
        }
      } catch (err) {
        console.error('Failed to fetch tracking:', err);
        setError('Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderTracking();
  }, [orderId]);

  const handleLocationClick = () => {
    const address = "42 General Alejo G. Santos Hwy, Angat, 3012 Bulacan";
    const name = "ANGEL TOLITS INTEGRATED FARM SCHOOL,INC.";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-lime-900">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderTracking) {
    return (
      <div className="min-h-screen bg-lime-50 p-6 flex items-center justify-center">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-4">Error Loading Order</h2>
          <p className="mb-4">{error || 'Order tracking information not available'}</p>
          <button
            onClick={() => navigate('/order-requests')}
            className="px-4 py-2 bg-lime-900 text-white rounded hover:bg-lime-600/75"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (orderStatus === 'shipped') {
    return (
      <div className="min-h-screen bg-orange-50 p-6 flex items-center justify-center">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-green-700 mb-4">Item Received</h2>
          <p className="mb-4">
            We've received the item/product. Please wait for further completion of transactions.
          </p>
          <button
            onClick={() => navigate('/seller-dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Back to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (orderStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-orange-50 p-6 flex items-center justify-center">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-700 mb-4">Order Cancelled</h2>
          <p className="mb-4">We're sorry for the inconvenience. This order has been cancelled.</p>
          <button
            onClick={() => navigate('/seller-dashboard')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">

      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border border-orange-200 mt-4">
        <h1 className="text-2xl font-bold text-lime-900 mb-4 text-center">
          Order Accepted Successfully
        </h1>

        <div className="mb-6 p-4 bg-orange-50 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Delivery Instructions:</h2>
          <p className="mb-2">Please prepare and drop off your items at:</p>
          <div className="bg-white p-3 rounded border border-orange-200">
            <p className="font-medium">Angel Tolits Integrated Farm,</p>
            <hr />
            <p>123 Sweetheart Street,</p>
            <hr />
            <p>Barangay donacion,</p>
            <hr />
            <p>Near Tres Marias Resort,</p>
            <hr />
            <li 
              className="cursor-pointer hover:text-lime-400 transition-colors"
              onClick={handleLocationClick}
            >
              See on Google Maps
            </li>
          </div>
        </div>

        <div className="mb-6 p-4 bg-lime-200/75 rounded-lg text-center">
          <p className="text-sm font-medium mb-1">Your Order Tracking Code:</p>
          <p className="text-3xl font-bold font-mono text-lime-800">
            {orderTracking.orderCode}
          </p>
          <p className="text-xs mt-2 text-lime-700">
            Present this code when dropping off your items
          </p>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="font-medium">Payment Status:</p>
          <p className={`font-semibold ${
            orderTracking.paymentStatus === 'Paid'
              ? 'text-lime-900'
              : 'text-lime-800/75'
          }`}>
            {orderTracking.paymentStatus}
          </p>
        </div>

        <button
          onClick={() => navigate('/seller-ongoing-orders')}
          className="w-full py-2 bg-lime-700 text-white rounded hover:bg-lime-600/75 cursor-pointer transition"
        >
          Back to Order Requests
        </button>
      </div>
    </div>
  );
}
