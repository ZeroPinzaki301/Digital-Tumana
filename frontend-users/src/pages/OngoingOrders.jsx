
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const OngoingOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/customer/order/ongoing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.data);
      } catch (error) {
        console.error('Error fetching ongoing orders:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading orders...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/marketplace")}
        className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition"
      >
        ⬅ Back to Marketplace
      </button>
      <h2 className="text-3xl font-semibold mb-4 text-lime-900 text-center">Your Ongoing Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">You have no ongoing orders.</p>
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
      
      <div>
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

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
            {status}
          </span>
          <span className="text-lg font-semibold text-gray-800">₱{totalPrice.toFixed(2)}</span>
        </div>
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
