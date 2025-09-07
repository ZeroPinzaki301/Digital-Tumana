import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const OngoingOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/customer/order/ongoing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.data);
        setFilteredOrders(res.data.data);
      } catch (error) {
        console.error('Error fetching ongoing orders:', error.message);
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
        Your Ongoing Orders
      </h2>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          onClick={() => filterOrdersByStatus('all')}
          className={`py-2 px-4 rounded-lg transition ${
            selectedStatus === 'all'
              ? 'bg-lime-700 text-white'
              : 'bg-lime-200 text-lime-800 hover:bg-lime-300'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => filterOrdersByStatus('pending')}
          className={`py-2 px-4 rounded-lg transition ${
            selectedStatus === 'pending'
              ? 'bg-lime-700 text-white'
              : 'bg-lime-200 text-lime-800 hover:bg-lime-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => filterOrdersByStatus('shipped')}
          className={`py-2 px-4 rounded-lg transition ${
            selectedStatus === 'shipped'
              ? 'bg-lime-700 text-white'
              : 'bg-lime-200 text-lime-800 hover:bg-lime-300'
          }`}
        >
          Shipped
        </button>
        <button
          onClick={() => filterOrdersByStatus('out for delivery')}
          className={`py-2 px-4 rounded-lg transition ${
            selectedStatus === 'out for delivery'
              ? 'bg-lime-700 text-white'
              : 'bg-lime-200 text-lime-800 hover:bg-lime-300'
          }`}
        >
          Out for Delivery
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-600">
          {selectedStatus === 'all' 
            ? 'You have no ongoing orders.' 
            : `You have no ${selectedStatus} orders.`
          }
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order }) => {
  const { _id, sellerId, items, status, totalPrice } = order;
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/customer/ongoing-order/${_id}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
      {/* View Details Button - Only show for "out for delivery" orders */}
      {status === 'out for delivery' && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleViewDetails}
            className="cursor-pointer py-1 px-3 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-500 transition"
          >
            View Order Details
          </button>
        </div>
      )}

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

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
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

      {/* Status & Total */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
          {status}
        </span>
        <span className="text-lg font-bold text-lime-900">₱{totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};

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
    default:
      return 'bg-lime-50 text-lime-800';
  }
};

export default OngoingOrdersPage;