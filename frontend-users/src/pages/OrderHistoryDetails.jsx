import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

const OrderHistoryDetailsPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const navigate = useNavigate();
  const { orderId } = useParams(); // Fixed: useParams should be destructured

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get(`/api/customer/order/history/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrderDetails(res.data.data);
        
        // Check if user has already rated this order
        if (res.data.data.riderInfo && res.data.data.orderDetails.status === 'completed') {
          checkExistingRating(orderId); // Use the orderId from params
        }
      } catch (error) {
        console.error('Error fetching order details:', error.message);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const checkExistingRating = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/api/rider/rating/customer/check/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.data.hasRated) {
        setHasRated(true);
        setExistingRating(res.data.data.rating);
      }
    } catch (error) {
      console.error('Error checking existing rating:', error.message);
    }
  };

  const handleRateClick = () => {
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('/api/rider/rating/customer/', {
        riderId: orderDetails.riderInfo._id,
        orderId: orderId, // Use the orderId from params
        rating,
        message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRatingSubmitted(true);
      setHasRated(true);
      setTimeout(() => {
        setShowRatingModal(false);
        setRatingSubmitted(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting rating:', error.message);
      alert('Failed to submit rating. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50 p-6 flex items-center justify-center">
        <p className="text-lg text-lime-800">Loading order details...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-lime-50 p-6">
        <button
          onClick={() => navigate("/customer/order-history")}
          className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition mb-6"
        >
          ⬅ Back to Order History
        </button>
        <div className="text-center">
          <p className="text-red-500 text-lg">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const { orderDetails: order, deliveryInfo, riderInfo } = orderDetails;

  return (
    <div className="min-h-screen bg-lime-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/customer/order-history")}
            className="py-2 px-4 bg-lime-700 text-white rounded-lg hover:bg-lime-600/75 cursor-pointer hover:text-sky-900 transition"
          >
            ⬅ Back to Order History
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-lime-900">
            Order Details
          </h2>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        {/* Order Status */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Order Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order {order.status === 'completed' ? 'Completed' : 'Cancelled'}</p>
              <p className="text-lime-800">{new Date(order.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Order Items and Seller Info */}
          <div className="space-y-6">
            {/* Seller Information */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
              <h3 className="text-lg font-semibold text-lime-800 mb-4">Seller Information</h3>
              <div className="flex items-center gap-4">
                <img
                  src={order.seller.storePicture || '/default-store.png'}
                  alt={order.seller.storeName}
                  className="h-16 w-16 rounded-full object-cover border border-lime-200"
                />
                <div>
                  <p className="font-semibold text-lime-800">{order.seller.storeName}</p>
                  <p className="text-sm text-gray-600">{order.seller.email}</p>
                  {order.seller.telephone && (
                    <p className="text-sm text-gray-600">{order.seller.telephone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
              <h3 className="text-lg font-semibold text-lime-800 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b border-lime-100 last:border-b-0">
                    <img
                      src={item.productId?.productImage || '/default-product.png'}
                      alt={item.productId?.productName || 'Product'}
                      className="h-20 w-20 object-cover rounded border border-lime-200"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-lime-800">{item.productId?.productName || 'Unnamed Product'}</p>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-lime-700">₱{item.priceAtOrder.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-lime-200">
                <p className="text-lg font-semibold text-lime-800">Total</p>
                <p className="text-xl font-bold text-lime-900">₱{order.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Delivery Information */}
          <div className="space-y-6">
            {/* Delivery Status */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
              <h3 className="text-lg font-semibold text-lime-800 mb-4">Order Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order Code</p>
                  <p className="text-lime-800 font-medium">{deliveryInfo.orderCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Placed</p>
                  <p className="text-lime-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                {deliveryInfo.deliveryProof && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Delivery Proof</p>
                    <img 
                      src={deliveryInfo.deliveryProof} 
                      alt="Delivery proof" 
                      className="w-full h-40 object-cover rounded border border-lime-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Rider Information - Only show if rider exists and order was completed */}
            {riderInfo && order.status === 'completed' && (
              <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-lime-800">Rider Information</h3>
                  {!hasRated && (
                    <button
                      onClick={handleRateClick}
                      className="py-1 px-3 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-500 transition"
                    >
                      Rate Kariton
                    </button>
                  )}
                </div>
                
                {hasRated && existingRating && (
                  <div className="mb-4 p-3 bg-lime-100 rounded-lg">
                    <p className="text-lime-800 font-medium">Your Rating: {existingRating.rating}/5</p>
                    {existingRating.message && (
                      <p className="text-lime-700 text-sm mt-1">"{existingRating.message}"</p>
                    )}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={riderInfo.profilePicture || '/default-avatar.png'}
                      alt={`${riderInfo.firstname} ${riderInfo.lastname}`}
                      className="h-16 w-16 rounded-full object-cover border border-lime-200"
                    />
                    <div>
                      <p className="font-semibold text-lime-800">{`${riderInfo.firstname} ${riderInfo.lastname}`}</p>
                      <p className="text-sm text-gray-600">{riderInfo.email}</p>
                    </div>
                  </div>
                  
                  {riderInfo.telephone && (
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="text-lime-800">{riderInfo.telephone}</p>
                    </div>
                  )}
                  
                  {riderInfo.facebookLink && (
                    <div>
                      <p className="text-sm text-gray-600">Facebook</p>
                      <a 
                        href={riderInfo.facebookLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lime-700 hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-lime-300">
              <h3 className="text-lg font-semibold text-lime-800 mb-4">Delivery Address</h3>
              <div className="space-y-2">
                {order.deliveryAddress.street && <p className="text-lime-800">{order.deliveryAddress.street}</p>}
                <p className="text-lime-800">{order.deliveryAddress.barangay}</p>
                <p className="text-lime-800">{order.deliveryAddress.cityOrMunicipality}, {order.deliveryAddress.province}</p>
                {order.deliveryAddress.postalCode && <p className="text-lime-800">{order.deliveryAddress.postalCode}</p>}
                {order.deliveryAddress.telephone && (
                  <p className="text-lime-800 mt-2">Tel: {order.deliveryAddress.telephone}</p>
                )}
                {order.deliveryAddress.email && (
                  <p className="text-lime-800">Email: {order.deliveryAddress.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-lime-800 mb-4">Rate Your Rider</h3>
            
            {ratingSubmitted ? (
              <div className="text-center py-4">
                <div className="text-lime-600 text-4xl mb-2">✓</div>
                <p className="text-lime-700 font-medium">Thank you for your rating!</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl focus:outline-none"
                      >
                        {star <= rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rating} out of 5 stars</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your experience with this rider..."
                    className="w-full p-2 border border-lime-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-500 transition"
                  >
                    Submit Rating
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
    case 'completed':
      return 'bg-lime-500 text-white';
    case 'cancelled':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-lime-50 text-lime-800';
  }
};

export default OrderHistoryDetailsPage;