import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft, FaUser, FaCheck, FaMotorcycle, FaTimes } from 'react-icons/fa';

const AdminAssignRider = () => {
  const { orderId } = useParams();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get('/api/kariton/kariton-riders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Directly use the array response
        setRiders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching riders:', error);
        setError(error.response?.data?.message || 'Failed to load riders');
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  const handleAssignRider = async () => {
    if (!selectedRider) {
      setModalMessage('Please select a rider first');
      setShowErrorModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmAssignment = async () => {
    setShowConfirmModal(false);
    
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post(
        `/api/order-to-deliver/${orderId}/assign-rider`,
        { riderId: selectedRider },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Show success message
      setModalMessage('Rider has been successfully assigned! The order is now out for delivery.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error assigning rider:', error);
      setModalMessage(error.response?.data?.message || 'Failed to assign rider');
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/admin-shipped-orders');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading available riders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex justify-center items-center">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Riders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Rider Assignment</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to assign this rider to the order?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="text-green-500 text-4xl mb-4 flex justify-center">
              <FaCheck className="bg-green-100 p-2 rounded-full" size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Success!</h3>
            <p className="text-gray-600 mb-6 text-center">{modalMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={handleSuccessClose}
                className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="text-red-500 text-4xl mb-4 flex justify-center">
              <FaTimes className="bg-red-100 p-2 rounded-full" size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Error</h3>
            <p className="text-gray-600 mb-6 text-center">{modalMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Order
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaMotorcycle className="mr-3 text-sky-500" />
            Assign Rider for Order #{orderId}
          </h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Available Riders
            </h2>
            
            {riders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No riders available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riders.map((rider) => (
                  <div
                    key={rider._id}
                    onClick={() => setSelectedRider(rider._id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRider === rider._id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-4">
                        {rider.profilePicture ? (
                          <img
                            src={rider.profilePicture}
                            alt={`${rider.firstName} ${rider.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {rider.firstName} {rider.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{rider.email}</p>
                        <p className="text-sm text-gray-500">
                          {rider.municipality}, {rider.province}
                        </p>
                      </div>
                      {selectedRider === rider._id && (
                        <div className="ml-auto text-sky-500">
                          <FaCheck />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAssignRider}
              disabled={!selectedRider}
              className={`px-4 py-2 rounded flex items-center ${
                selectedRider
                  ? 'bg-sky-500 text-white hover:bg-sky-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaCheck className="mr-2" />
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignRider;