import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft, FaTruck, FaTimesCircle, FaCheckCircle, FaBox, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';

const AdminConfirmedOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get(`/api/order-tracking/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrder(response.data.order);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.response?.data?.message || 'Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, statusUpdate]);

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axiosInstance.put(
        `/api/order-tracking/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Show success message
      alert(`Order has been successfully marked as ${newStatus}`);
      
      // Navigate back to ongoing orders if status is 'shipped'
      if (newStatus === 'shipped') {
        navigate('/admin-ongoing-orders');
      } else {
        setStatusUpdate(newStatus); // Triggers re-fetch for other status changes
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update status');
    }
  };

  // ... rest of your component remains exactly the same ...
  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex justify-center items-center">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex justify-center items-center">
        <div className="max-w-md text-center">
          <div className="text-gray-400 text-5xl mb-4">
            <FaBox />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The requested order could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Calculate products subtotal (total minus shipping)
  const productsSubtotal = order.totalPrice - 50;
  const shippingFee = 50;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Confirmed Orders
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Order Code: {order.orderCode}
              </h1>
              <h2 className="text-l text-gray-500">
                Order id: {order._id}
              </h2>
              <p className="text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Buyer Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <FaUser className="mr-2 text-blue-500" />
                Buyer Information
              </h2>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="font-medium mr-2">Name:</span>
                  {order.buyerId?.firstName} {order.buyerId?.lastName}
                </p>
                <p className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  {order.deliveryAddress?.email || 'N/A'}
                </p>
                <p className="flex items-center">
                  <FaPhone className="mr-2 text-gray-400" />
                  {order.deliveryAddress?.telephone || 'N/A'}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                Delivery Address
              </h2>
              <div className="space-y-2">
                <p>{order.deliveryAddress?.street}</p>
                <p>{order.deliveryAddress?.barangay}</p>
                <p>
                  {order.deliveryAddress?.cityOrMunicipality}, {order.deliveryAddress?.province}
                </p>
                <p>{order.deliveryAddress?.region}</p>
                <p>Postal Code: {order.deliveryAddress?.postalCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Items</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.productId?.images?.[0] ? (
                            <img 
                              src={item.productId.images[0]} 
                              alt={item.productId.name}
                              className="w-10 h-10 rounded-md object-cover mr-4"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 mr-4 flex items-center justify-center">
                              <FaBox className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.productId?.name || 'Product not available'}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.productId?.unitType || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{item.priceAtOrder.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ₱{(item.priceAtOrder * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Method:</p>
                <p className="font-medium">Cash on Delivery</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shipping Method:</p>
                <p className="font-medium">Standard Delivery</p>
              </div>
            </div>
          </div>

          {/* Enhanced Total Breakdown and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t pt-4">
            <div className="mb-4 md:mb-0 w-full md:w-auto">
              <div className="space-y-2 mb-4">
                {/* Products Subtotal */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Products Subtotal:</span>
                  <span className="text-sm font-medium">
                    ₱{productsSubtotal.toFixed(2)}
                  </span>
                </div>
                
                {/* Shipping Fee */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping Fee:</span>
                  <span className="text-sm font-medium">₱{shippingFee.toFixed(2)}</span>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Order Total */}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Order Total:</span>
                  <span className="text-xl font-bold text-gray-800">
                    ₱{order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="w-full md:w-auto">
              {order.status === 'confirmed' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStatusUpdate('shipped')}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <FaTruck className="mr-2" />
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTimesCircle className="mr-2" />
                    Cancel Order
                  </button>
                </div>
              )}

              {order.status === 'shipped' && (
                <div className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800">
                  <FaCheckCircle className="mr-2" />
                  Order has been shipped
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800">
                  <FaTimesCircle className="mr-2" />
                  Order has been cancelled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmedOrderDetail;
