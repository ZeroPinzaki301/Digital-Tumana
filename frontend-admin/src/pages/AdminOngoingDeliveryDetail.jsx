import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import {
  FaArrowLeft,
  FaStore,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaTruck,
  FaClipboardList
} from 'react-icons/fa';

const AdminPendingPaymentDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get(`/api/order-to-deliver/tracking/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setOrderDetails(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleBack = () => navigate(-1);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading order details...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  const {
    orderCode,
    totalPrice,
    paymentStatus,
    orderStatus,
    orderCreatedAt,
    assignedAt,
    isDelivered,
    deliveryProof,
    seller,
    rider,
    deliveryAddress,
    deliveryCoordinates,
    items
  } = orderDetails;

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow hover:bg-gray-100 cursor-pointer text-gray-700 font-medium transition flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-center text-sky-800 mb-6">
        Order Tracking Details
      </h2>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order Code</p>
            <p className="font-semibold text-lg">{orderCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="font-semibold text-lg">₱{totalPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className="font-semibold text-lg">{paymentStatus}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Status</p>
            <p className="font-semibold text-lg capitalize">{orderStatus}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-semibold text-lg">{new Date(orderCreatedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assigned At</p>
            <p className="font-semibold text-lg">{new Date(assignedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
          <FaStore /> Seller Information
        </h3>
        <p><strong>Name:</strong> {seller?.name}</p>
        <p><strong>Address:</strong> {Object.values(seller?.address || {}).join(', ')}</p>
      </div>

      {/* Seller Map */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt /> Seller Location
        </h3>
        <div className="w-full h-64 rounded overflow-hidden">
          <iframe
            title="Seller Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${seller?.coordinates?.latitude},${seller?.coordinates?.longitude}&hl=es;z=14&output=embed`}
          ></iframe>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt /> Delivery Information
        </h3>
        <p><strong>Address:</strong> {Object.values(deliveryAddress || {}).join(', ')}</p>
        <p><strong>Delivered:</strong> {isDelivered ? 'Yes' : 'No'}</p>
        {deliveryProof && (
          <p>
            <strong>Proof:</strong>{' '}
            <a href={deliveryProof} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View
            </a>
          </p>
        )}
      </div>

      {/* Delivery Map */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt /> Delivery Location
        </h3>
        <div className="w-full h-64 rounded overflow-hidden">
          <iframe
            title="Delivery Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${deliveryCoordinates?.latitude},${deliveryCoordinates?.longitude}&hl=es;z=14&output=embed`}
          ></iframe>
        </div>
      </div>

      {/* Rider Info */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
          <FaTruck /> Rider Information
        </h3>
        <div className="flex items-center gap-4">
          <img
            src={rider?.profilePicture || '/default-profile.png'}
            alt="Rider"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <p><strong>Name:</strong> {rider?.name}</p>
            <p><strong>ID:</strong> {rider?.id}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
          <FaClipboardList /> Items
        </h3>
        {items?.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2">
            {items.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong> — Qty: {item.quantity}, Price: ₱{item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No items found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPendingPaymentDetailsPage;
