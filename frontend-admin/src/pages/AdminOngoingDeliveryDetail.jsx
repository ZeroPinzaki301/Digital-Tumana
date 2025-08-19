import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft, FaStore, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

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
        const response = await axiosInstance.get(`/api/admin/seller-balance/pending-payment/${orderId}`, {
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

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-order-details">
      <button onClick={handleBack} className="back-button">
        <FaArrowLeft /> Back
      </button>

      <h2>Pending Payment Order Details</h2>

      <div className="order-info">
        <p><strong>Order Code:</strong> {orderDetails.orderCode}</p>
        <p><FaStore /> <strong>Seller ID:</strong> {orderDetails.sellerId}</p>
        <p><FaMoneyBillWave /> <strong>Total Price:</strong> ₱{orderDetails.totalPrice.toFixed(2)}</p>
        <p><strong>Status:</strong> {orderDetails.status}</p>
        <p><FaCalendarAlt /> <strong>Created At:</strong> {new Date(orderDetails.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AdminPendingPaymentDetailsPage;