import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('completed');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/customer/order/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort orders by updatedAt date (newest first)
        const sortedOrders = res.data.data.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        setOrders(sortedOrders);
        // Initially show completed orders
        setFilteredOrders(sortedOrders.filter(order => order.status === 'completed'));
      } catch (error) {
        console.error('Error fetching order history:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filterOrdersByStatus = (status) => {
    setSelectedStatus(status);
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === status));
    }
  };

  return (
    <div className="min-h-screen bg-lime-50 p-6">
      <button
        onClick={() => navigate("/marketplace")}
        className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition mb-6"
      >
        ⬅ Back to Marketplace
      </button>

      <h2 className="text-2xl md:text-3xl font-bold text-lime-900 mb-6 text-center">
        Your Order History
      </h2>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          onClick={() => filterOrdersByStatus('completed')}
          className={`py-2 px-4 rounded-lg transition ${
            selectedStatus === 'completed'
              ? 'bg-lime-700 text-white'
              : 'bg-lime-200 text-lime-800 hover:bg-lime-300'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => filterOrdersByStatus('cancelled')}
          className={`py-2 px-4 rounded-lg transition ${
            selectedStatus === 'cancelled'
              ? 'bg-lime-700 text-white'
              : 'bg-lime-200 text-lime-800 hover:bg-lime-300'
          }`}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading order history...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-600">
          {selectedStatus === 'completed' 
            ? 'You have no completed orders.' 
            : 'You have no cancelled orders.'
          }
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map(order => (
            <OrderCard key={order._id} order={order} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, navigate }) => {
  const { _id, sellerId, items, status, totalPrice } = order;

  const handleViewDetails = () => {
    navigate(`/customer/order-history/${_id}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
      {/* View Details Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleViewDetails}
          className="cursor-pointer py-1 px-3 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-500 transition"
        >
          View Details
        </button>
      </div>

      {/* Seller Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={sellerId.storePicture || '/default-store.png'}
          alt={sellerId.storeName}
          className="h-16 w-16 rounded-full object-cover border border-lime-200"
        />
        <div>
          <h3 className="text-lg font-semibold text-lime-800">{sellerId.storeName}</h3>
          <p className="text-sm text-gray-600">{sellerId.email}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-4">
            <img
              src={item.productId?.productImage || '/default-product.png'}
              alt={item.productId?.productName || 'Product'}
              className="h-20 w-20 object-cover rounded border border-lime-200"
            />
            <div>
              <p className="font-semibold text-lime-800">{item.productId?.productName || 'Unnamed Product'}</p>
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
        <span className="text-lg font-bold text-lime-900">₱{totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Tailwind badge color helper with CartPage-like lime color scheme
const getStatusBadgeColor = status => {
  switch (status) {
    case 'pending':
      return 'bg-lime-100 text-lime-800';
    case 'confirmed':
      return 'bg-lime-200 text-lime-900';
    case 'shipped':
      return 'bg-lime-300 text-lime-900';
    case 'out for delivery':
      return 'bg-lime-400 text-lime-900';
    case 'completed':
      return 'bg-lime-500 text-white';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-lime-50 text-lime-800';
  }
};

export default OrderHistoryPage;