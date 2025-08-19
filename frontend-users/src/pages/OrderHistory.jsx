import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/customer/order/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.data);
      } catch (error) {
        console.error('Error fetching order history:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading order history...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📦 Your Order History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">You have no completed or cancelled orders.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order }) => {
  const { sellerId, items, status, totalPrice } = order;

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white">
      {/* Seller Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={sellerId.storePicture || '/default-store.png'}
          alt="Store"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="text-lg font-medium">{sellerId.storeName}</h3>
          <p className="text-sm text-gray-500">{sellerId.email}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-4">
            <img
              src={item.productId?.productImage || '/default-product.png'}
              alt={item.productId?.productName || 'Product'}
              className="w-14 h-14 rounded-md object-cover"
            />
            <div>
              <p className="font-medium">{item.productId?.productName || 'Unnamed Product'}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              <p className="text-sm text-gray-600">₱{item.priceAtOrder.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
          {status}
        </span>
        <span className="text-lg font-semibold text-gray-800">₱{totalPrice.toFixed(2)}</span>
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

export default OrderHistoryPage;