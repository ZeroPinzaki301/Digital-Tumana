import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const SellerOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('completed');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/orders/seller/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort orders by updatedAt in descending order (newest first)
        const sortedOrders = res.data.orders.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        setOrders(sortedOrders);
        // Filter for completed orders by default
        setFilteredOrders(sortedOrders.filter(order => order.status === 'completed'));
      } catch (error) {
        console.error('Error fetching seller order history:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, []);

  // Filter orders when selectedStatus changes
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

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
        Order History
      </h2>

      {/* Status Filter Buttons */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setSelectedStatus('completed')}
          className={`px-4 py-2 rounded ${selectedStatus === 'completed' ? 'bg-lime-700 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Completed Orders
        </button>
        <button
          onClick={() => setSelectedStatus('cancelled')}
          className={`px-4 py-2 rounded ${selectedStatus === 'cancelled' ? 'bg-lime-700 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Cancelled Orders
        </button>
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded ${selectedStatus === 'all' ? 'bg-lime-700 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All Orders
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center">
          No {selectedStatus === 'all' ? '' : selectedStatus} orders found.
        </p>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <SellerOrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

const SellerOrderCard = ({ order }) => {
  const { buyerId, items, status, totalPrice, deliveryInfo, createdAt } = order;
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">Order Date: {date}</p>
          <h3 className="text-lg font-semibold">Order #{order._id.slice(-6).toUpperCase()}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Buyer Info */}
      <div className="bg-lime-100 p-4 rounded-md mb-4">
        <h4 className="font-medium text-lime-800 mb-2">Customer Information</h4>
        <div className="flex items-center gap-4">
          <img
            src={buyerId.userId?.profilePicture || '/default-user.png'}
            alt="Buyer"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium">{buyerId.fullName}</h3>
            <p className="text-sm text-gray-600">{buyerId.email}</p>
            <p className="text-sm text-gray-600">{buyerId.telephone}</p>
          </div>
        </div>
      </div>

      {/* Delivery Info (for completed orders) */}
      {status === 'completed' && deliveryInfo && (
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Delivery Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Rider Details:</p>
              {deliveryInfo.rider ? (
                <div className="flex items-center gap-3 mt-1">
                  <img
                    src={deliveryInfo.rider.profilePicture || '/default-user.png'}
                    alt="Rider"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p>{deliveryInfo.rider.firstName} {deliveryInfo.rider.lastName}</p>
                    <p className="text-xs text-gray-600">{deliveryInfo.rider.email}</p>
                    <p className="text-xs text-gray-600">{deliveryInfo.rider.telephone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No rider information available</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Delivery Status:</p>
              <p className={`text-sm ${deliveryInfo.isDelivered ? 'text-green-600' : 'text-yellow-600'}`}>
                {deliveryInfo.isDelivered ? 'Delivered Successfully' : 'In Transit'}
              </p>
              {deliveryInfo.deliveryProof && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Delivery Proof:</p>
                  <a 
                    href={deliveryInfo.deliveryProof} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    View Proof
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-3">Order Items</h4>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item._id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
              <img
                src={item.productId?.productImage || '/default-product.png'}
                alt={item.productId?.productName || 'Product'}
                className="w-14 h-14 rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.productId?.productName || 'Unnamed Product'}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Qty: {item.quantity}</span>
                  <span>₱{item.priceAtOrder.toFixed(2)} each</span>
                </div>
                <p className="text-xs text-gray-500 italic">Status: {item.itemStatus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600">Shipping Fee: ₱50.00</p>
          <p className="text-lg font-semibold text-gray-800">
            Total: ₱{totalPrice.toFixed(2)}
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Subtotal: ₱{(totalPrice - 50).toFixed(2)}
        </p>
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