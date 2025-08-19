import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaMapMarkerAlt, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';

const RiderDeliveryDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('karitonToken');
        const response = await axiosInstance.get(`/api/kariton/delivery-details/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDeliveryData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching delivery details:', err);
        setError(err.response?.data?.error || 'Failed to fetch delivery details');
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orderId]);

  const handleProofUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return alert('Please select an image first.');

    const formData = new FormData();
    formData.append('deliveryProof', file);

    try {
      const token = localStorage.getItem('karitonToken');
      await axiosInstance.put(`/api/kariton/delivery-status/${orderId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowSuccess(true);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload proof.');
    }
  };

  if (loading) return <div className="p-6">Loading delivery details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Delivery Details</h1>

        <p><strong>Order Code:</strong> {deliveryData.orderCode}</p>
        <p><strong>Buyer:</strong> {deliveryData.buyerName}</p>

        <div className="mt-4">
          <FaMapMarkerAlt className="inline mr-2 text-green-500" />
          <span className="font-semibold">Delivery Location:</span>
          <p className="ml-6 text-gray-700">
            {deliveryData.deliveryAddress.street}, {deliveryData.deliveryAddress.barangay}, {deliveryData.deliveryAddress.cityOrMunicipality}, {deliveryData.deliveryAddress.province}, {deliveryData.deliveryAddress.region}, {deliveryData.deliveryAddress.postalCode}
          </p>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold text-lg mb-2">Items</h2>
          <div className="space-y-4">
            {deliveryData.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 border-b pb-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-gray-800">{item.productName}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity} — ₱{item.priceAtOrder}</p>
                  <p className="text-xs text-gray-500">Status: {item.itemStatus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Map Preview</h2>
          <iframe
            title="delivery-location"
            width="100%"
            height="250"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${deliveryData.coordinates.latitude},${deliveryData.coordinates.longitude}&z=16&output=embed`}
            allowFullScreen
          ></iframe>
        </div>

        {!deliveryData.isDelivered && !showSuccess && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Upload Delivery Proof</h2>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="mb-4 block w-full border p-2 rounded"
            />
            <button
              onClick={handleProofUpload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit Proof & Complete Delivery
            </button>
          </div>
        )}

        {showSuccess && (
          <div className="mt-8 text-center">
            <FaCheckCircle className="mx-auto mb-2 text-green-500 text-3xl" />
            <p className="text-green-700 text-lg font-medium">Delivery completion has been submitted.</p>
            <button
              onClick={() => navigate('/kariton-service/rider/delivery-requests')}
              className="mt-4 px-5 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Back to Delivery Requests
            </button>
          </div>
        )}

        {deliveryData.isDelivered && !showSuccess && (
          <div className="mt-8 flex items-center text-green-700">
            <FaCheckCircle className="mr-2 text-xl" />
            <span className="font-medium">Delivery has been completed.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDeliveryDetails;