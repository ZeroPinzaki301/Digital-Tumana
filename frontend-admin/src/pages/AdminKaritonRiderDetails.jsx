import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaArrowLeft } from 'react-icons/fa';

const AdminKaritonRiderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="p-6">Loading rider details...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
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
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to List
        </button>

        <h2 className="text-2xl font-bold mb-4">{rider.firstName} {rider.lastName}</h2>

        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div><strong>Email:</strong> {rider.email}</div>
          <div><strong>Facebook:</strong> {rider.facebookLink || 'N/A'}</div>
          <div><strong>Birthdate:</strong> {new Date(rider.birthdate).toLocaleDateString()}</div>
          <div><strong>Age:</strong> {rider.age}</div>
          <div><strong>Address:</strong> {`${rider.houseNo}, ${rider.street}, ${rider.barangay}, ${rider.municipality}, ${rider.province}`}</div>
          <div><strong>Status:</strong> {rider.isActive ? 'Active' : 'Inactive'}</div>
          <div><strong>Login Code:</strong> {rider.loginCode}</div>
          <div><strong>Created:</strong> {new Date(rider.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminKaritonRiderDetails;