import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaSearch, FaUserPlus, FaStar, FaExclamationTriangle } from 'react-icons/fa';
import Modal from 'react-modal';

// Set app element for accessibility (make sure to set this to your app's root element id)
Modal.setAppElement('#root');

const AdminKaritonService = () => {
  const [karitonRiders, setKaritonRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('active'); // 'active' or 'inactive'
  const [ratings, setRatings] = useState({}); // Store ratings by riderId
  const navigate = useNavigate();
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [riderToUpdate, setRiderToUpdate] = useState(null);

  useEffect(() => {
    const fetchKaritonRiders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const endpoint =
          filterType === 'inactive'
            ? '/api/kariton/inactive-riders'
            : '/api/kariton/kariton-riders';

        const response = await axiosInstance.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setKaritonRiders(response.data);
        setFilteredRiders(response.data);
        
        // Fetch ratings for each rider
        fetchRatingsForRiders(response.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Kariton riders:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
        
        // Show error modal
        showModal(
          'Error',
          err.response?.data?.message || 'Failed to fetch Kariton riders data.',
          'error'
        );
      }
    };

    fetchKaritonRiders();
  }, [filterType]);

  const fetchRatingsForRiders = async (riders) => {
    try {
      const token = localStorage.getItem('adminToken');
      const ratingsData = {};
      
      // Fetch ratings for each rider
      for (const rider of riders) {
        try {
          const response = await axiosInstance.get(`/api/rider/rating/admin/${rider._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Calculate average rating
          const riderRatings = response.data.data;
          const totalRatings = riderRatings.length;
          const averageRating = totalRatings > 0 
            ? riderRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
            : 0;
          
          ratingsData[rider._id] = {
            average: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            total: totalRatings
          };
        } catch (err) {
          console.error(`Error fetching ratings for rider ${rider._id}:`, err);
          ratingsData[rider._id] = { average: 0, total: 0 };
        }
      }
      
      setRatings(ratingsData);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  useEffect(() => {
    const results = karitonRiders.filter(rider =>
      `${rider.firstName} ${rider.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRiders(results);
  }, [searchTerm, karitonRiders]);

  const handleCreateClick = () => {
    navigate('/admin/create-kariton-rider');
  };

  // Function to show modal with custom content
  const showModal = (title, message, type = 'info') => {
    setModalContent({
      title,
      message,
      type
    });
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setRiderToUpdate(null);
  };

  // Function to handle rider status update
  const handleStatusUpdate = async () => {
    if (!riderToUpdate) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.patch(
        `/api/kariton/admin/update-status/${riderToUpdate._id}`,
        { isActive: !riderToUpdate.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRiders = karitonRiders.map(r =>
        r._id === riderToUpdate._id ? { ...r, isActive: response.data.data.isActive } : r
      );
      setKaritonRiders(updatedRiders);
      setFilteredRiders(updatedRiders);
      
      // Show success modal
      showModal(
        'Success',
        `Rider has been ${response.data.data.isActive ? 'activated' : 'deactivated'} successfully.`,
        'success'
      );
    } catch (err) {
      console.error('Error updating rider status:', err);
      showModal(
        'Error',
        err.response?.data?.error || 'Failed to update rider status.',
        'error'
      );
    }
  };

  // Function to confirm status change
  const confirmStatusChange = (rider) => {
    setRiderToUpdate(rider);
    showModal(
      'Confirm Status Change',
      `Are you sure you want to ${rider.isActive ? 'deactivate' : 'activate'} ${rider.firstName} ${rider.lastName}?`,
      'confirm'
    );
  };

  // Custom styles for the modal to match the color scheme
  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '500px',
      width: '90%',
      borderRadius: '8px',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '0',
      overflow: 'hidden'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kariton Riders</h1>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleCreateClick}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaUserPlus />
            Create Kariton Rider Account
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => setFilterType('active')}
              className={`px-4 hover:bg-sky-700/25 cursor-pointer py-2 rounded ${
                filterType === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Active Riders
            </button>
            <button
              onClick={() => setFilterType('inactive')}
              className={`cursor-pointer hover:bg-sky-700/25 px-4 py-2 rounded ${
                filterType === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Inactive Riders
            </button>
          </div>

          <div className="relative w-1/2">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-3">Rating</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {filteredRiders.map(rider => (
            <div
              key={rider._id}
              className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/admin/kariton-rider/${rider._id}`)}
            >
              <div className="col-span-3 font-medium text-blue-600">
                {rider.firstName} {rider.lastName}
              </div>
              <div className="col-span-3">{rider.email}</div>
              <div className="col-span-3">
                {ratings[rider._id] ? (
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    <span className="font-medium">{ratings[rider._id].average}</span>
                    <span className="text-sm text-gray-500">({ratings[rider._id].total} ratings)</span>
                  </div>
                ) : (
                  <span className="text-gray-400">No ratings yet</span>
                )}
              </div>
              <div className="col-span-2">
                {rider.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="col-span-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmStatusChange(rider);
                  }}
                  className={`text-sm px-2 py-1 rounded cursor-pointer ${
                    rider.isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {rider.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}

          {filteredRiders.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No riders match your search.' : 'No Kariton Riders found.'}
            </div>
          )}
        </div>
      </div>

      {/* Modal for confirmation and messages */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Modal"
      >
        <div className={`p-6 rounded-lg ${modalContent.type === 'error' ? 'bg-red-50' : modalContent.type === 'success' ? 'bg-green-50' : 'bg-blue-50'}`}>
          <div className="flex items-center mb-4">
            {modalContent.type === 'error' && (
              <FaExclamationTriangle className="text-red-500 text-xl mr-2" />
            )}
            {modalContent.type === 'success' && (
              <FaStar className="text-green-500 text-xl mr-2" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">{modalContent.title}</h2>
          </div>
          
          <p className="mb-6 text-gray-600">{modalContent.message}</p>
          
          <div className="flex justify-end space-x-4">
            {modalContent.type === 'confirm' ? (
              <>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    handleStatusUpdate();
                  }}
                  className={`px-4 py-2 text-white rounded ${
                    riderToUpdate?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={closeModal}
                className={`px-4 py-2 text-white rounded ${
                  modalContent.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 
                  modalContent.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 
                  'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminKaritonService;