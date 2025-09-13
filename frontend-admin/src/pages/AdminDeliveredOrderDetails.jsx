import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaBoxOpen } from 'react-icons/fa';
import Modal from 'react-modal';

// Set app element for accessibility
Modal.setAppElement('#root');

const AdminDeliveredOrderDetails = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  
  // Modal states
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [completionErrorModalIsOpen, setCompletionErrorModalIsOpen] = useState(false);
  const [completionSuccessModalIsOpen, setCompletionSuccessModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get(
          `/api/order-to-deliver/delivered/details/${deliveryId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setDelivery(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching delivery details:', error);
        setError(error.response?.data?.message || 'Failed to load delivery data');
        setLoading(false);
        setErrorModalIsOpen(true);
      }
    };

    fetchDeliveryDetails();
  }, [deliveryId]);

  const handleMarkAsCompleted = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.put(
        `/api/order-to-deliver/mark-completed/${deliveryId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDelivery(prev => ({
        ...prev,
        orderSummary: {
          ...prev.orderSummary,
          orderStatus: 'Completed'
        }
      }));
      setCompleted(true);
      setCompletionSuccessModalIsOpen(true);
    } catch (error) {
      console.error('Error marking as completed:', error);
      setCompletionErrorModalIsOpen(true);
    }
  };

  // Modal styles that match your color scheme
  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '32rem',
      width: '90%'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading delivery details…</div>;
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>{error || 'Delivery details not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Delivery Details</h1>

        {/* Order Reference */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Order Reference</h2>
          <div className="text-gray-800 space-y-1">
            <p><strong>Order ID:</strong> {delivery.orderId}</p>
            <p><strong>Order Code:</strong> {delivery.orderCode || 'N/A'}</p>
          </div>
        </div>

        {/* Rider Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Rider Information</h2>
          <div className="flex items-center gap-4">
            <img
              src={delivery.rider.profilePicture}
              alt="Rider"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <p className="font-medium">{delivery.rider.name}</p>
              <p className="text-sm text-gray-600">📞 {delivery.rider.contact.phone}</p>
              <p className="text-sm text-gray-600">📧 {delivery.rider.contact.email}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Delivery Address</h2>
          <div className="text-gray-700 space-y-1">
            <p>{delivery.deliveryAddress.street}, {delivery.deliveryAddress.barangay}</p>
            <p>{delivery.deliveryAddress.city}, {delivery.deliveryAddress.province}</p>
            <p>{delivery.deliveryAddress.region}, {delivery.deliveryAddress.postalCode}</p>
            <p>📞 {delivery.deliveryAddress.telephone}</p>
            <p>📧 {delivery.deliveryAddress.email}</p>
          </div>
        </div>

        {/* Proof */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Delivery Proof</h2>
          {delivery.deliveryProof ? (
            <img
              src={delivery.deliveryProof}
              alt="Delivery Proof"
              className="w-full rounded-lg border object-contain"
            />
          ) : (
            <p className="text-gray-500">No delivery proof uploaded</p>
          )}
        </div>

        {/* Item Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaBoxOpen /> Order Summary
          </h2>
          {delivery.items?.length > 0 ? (
            <div className="space-y-4">
              {delivery.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center border p-4 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">₱{item.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {item.itemStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found in order.</p>
          )}
        </div>

        {/* Order Totals */}
        <div className="text-sm text-gray-600">
          <p><strong>Total Price:</strong> ₱{delivery.orderSummary?.totalPrice?.toFixed(2)}</p>
          <p><strong>Status:</strong> {delivery.orderSummary?.orderStatus}</p>
          <p className="mt-2">Delivered At: {new Date(delivery.deliveredAt).toLocaleString()}</p>
        </div>

        {/* Completion Button */}
        {!completed && delivery.orderSummary?.orderStatus !== 'Completed' && (
          <button
            onClick={handleMarkAsCompleted}
            className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded"
          >
            ✅ Mark as Completed
          </button>
        )}

        {/* Success Prompt and Redirect */}
        {completed && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded text-green-800">
            <p className="mb-3 font-semibold">Order has been marked as <span className="underline">Completed</span>!</p>
            <button
              onClick={() => navigate('/admin/orders/delivered')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded"
            >
              ← Back to Delivered Orders
            </button>
          </div>
        )}
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={errorModalIsOpen}
        onRequestClose={() => setErrorModalIsOpen(false)}
        style={customModalStyles}
        contentLabel="Error Modal"
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-red-600 mb-3">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={() => setErrorModalIsOpen(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Completion Error Modal */}
      <Modal
        isOpen={completionErrorModalIsOpen}
        onRequestClose={() => setCompletionErrorModalIsOpen(false)}
        style={customModalStyles}
        contentLabel="Completion Error Modal"
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-red-600 mb-3">Error</h2>
          <p className="text-gray-700 mb-4">Failed to mark order as completed. Please try again.</p>
          <div className="flex justify-end">
            <button
              onClick={() => setCompletionErrorModalIsOpen(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Completion Success Modal */}
      <Modal
        isOpen={completionSuccessModalIsOpen}
        onRequestClose={() => setCompletionSuccessModalIsOpen(false)}
        style={customModalStyles}
        contentLabel="Completion Success Modal"
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-green-600 mb-3">Success</h2>
          <p className="text-gray-700 mb-4">Order has been successfully marked as completed!</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setCompletionSuccessModalIsOpen(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
            >
              Stay Here
            </button>
            <button
              onClick={() => navigate('/admin/orders/delivered')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDeliveredOrderDetails;