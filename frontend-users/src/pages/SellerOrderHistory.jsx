import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SellerOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/orders/seller/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders);
      } catch (error) {
        console.error('Error fetching seller order history:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading order history...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/seller-dashboard')}
        className="mb-6 px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800 transition cursor-pointer"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-3xl font-semibold mb-4 text-center text-lime-900">
        Completed & Cancelled Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">
          No completed or cancelled orders found.
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <SellerOrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

const SellerOrderCard = ({ order }) => {
  const { buyerId, items, status, totalPrice } = order;

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white">
      {/* Buyer Info */}
      <div className="bg-lime-500 py-2 px-5 flex items-center gap-4 mb-4 rounded-sm ">
        <h3 className="text-lg font-medium">Customer:</h3>
        <img
          src={buyerId.userId?.profilePicture || '/default-user.png'}
          alt="Buyer"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>

          <h3 className="text-lg font-medium">{buyerId.fullName}</h3>
          <p className="text-sm text-gray-500">{buyerId.email}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item._id} className="px-6 flex items-center gap-4">
            <h3 className="text-lg font-medium">Items:</h3>
            <img
              src={item.productId?.productImage || '/default-product.png'}
              alt={item.productId?.productName || 'Product'}
              className="w-14 h-14 rounded-md object-cover"
            />
            <div>
              <p className="font-medium">{item.productId?.productName || 'Unnamed Product'}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              <p className="text-sm text-gray-600">₱{item.priceAtOrder.toFixed(2)}</p>
              <p className="text-xs text-gray-500 italic">Status: {item.itemStatus}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
          {status}
        </span>
        <span className="text-lg font-semibold text-gray-800">
          ₱{(totalPrice - 50).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

// Tailwind badge color helper
const getStatusBadgeColor = status => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800';
    case 'out for delivery':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-green-200 text-green-900';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default SellerOrderHistory;
