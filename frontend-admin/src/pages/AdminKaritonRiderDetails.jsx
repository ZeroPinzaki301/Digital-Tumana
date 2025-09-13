import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft, FaCar, FaStar, FaUser } from 'react-icons/fa';

const AdminKaritonRiderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateAge = (birthdate) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hasHadBirthdayThisYear) {
      age--;
    }

    return age;
  };

  useEffect(() => {
    const fetchRider = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get(`/api/kariton/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRider(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rider details:', err);
        setError(err.response?.data?.message || 'Failed to fetch details');
        setLoading(false);
      }
    };
    fetchRider();
  }, [id]);

  useEffect(() => {
    if (rider) {
      fetchRatings();
    }
  }, [rider]);

  const fetchRatings = async () => {
    setRatingsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.get(`/api/rider/rating/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRatings(response.data.data || []);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err.response?.data?.message || 'Failed to fetch ratings');
    } finally {
      setRatingsLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (!ratings.length) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="p-6">Loading rider details...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Rider Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-semibold text-green-700 mb-4 text-center uppercase tracking-wide">Tumana Rider</h1>
          {rider.profilePicture && (
            <div className="mb-6 flex justify-center">
              <img
                src={rider.profilePicture}
                alt={`${rider.firstName} ${rider.lastName}`}
                className="w-32 h-32 object-cover rounded-full shadow"
              />
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              <FaArrowLeft />
              Back to List
            </button>
            
            <button
              onClick={() => navigate(`/admin/kariton/vehicle/${id}`)}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaCar />
              Vehicle Details
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-4">{rider.firstName} {rider.middleName} {rider.lastName}</h2>

          <div className="grid grid-cols-2 gap-4 text-gray-700 mb-4">
            <div><strong>Email:</strong> {rider.email}</div>
            <div><strong>Facebook:</strong> {rider.facebookLink || 'N/A'}</div>
            <div><strong>Birthdate:</strong> {new Date(rider.birthdate).toLocaleDateString()}</div>
            <div><strong>Age:</strong> {calculateAge(rider.birthdate)}</div>
            <div><strong>Address:</strong> {`${rider.houseNo}, ${rider.street}, ${rider.barangay}, ${rider.municipality}, ${rider.province}`}</div>
            <div><strong>Status:</strong> {rider.isActive ? 'Active' : 'Inactive'}</div>
            <div><strong>Created:</strong> {new Date(rider.createdAt).toLocaleString()}</div>
          </div>

          {/* Ratings Summary */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Ratings Summary</h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-blue-700">{calculateAverageRating()}</div>
              <div>
                <div className="flex">
                  {renderStars(calculateAverageRating())}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            Customer Ratings ({ratings.length})
          </h3>
          
          {ratingsLoading ? (
            <div className="text-center py-4">Loading ratings...</div>
          ) : ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <FaUser className="text-xs" /> Customer
                      </span>
                      <span className="font-medium">
                        {rating.userId?.firstName} {rating.userId?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(rating.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rating.userId?.email}</p>
                  {rating.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">"{rating.message}"</p>
                    </div>
                  )}
                  <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                    <span>Order: {rating.orderToDeliverId?.orderId || 'N/A'}</span>
                    <span>{formatDate(rating.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No ratings available for this rider.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKaritonRiderDetails;