import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaSearch, FaUserPlus, FaRegIdCard } from 'react-icons/fa';

const AdminKaritonService = () => {
  const [karitonRiders, setKaritonRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKaritonRiders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get('/api/kariton/kariton-riders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setKaritonRiders(response.data);
        setFilteredRiders(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Kariton riders:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };
    fetchKaritonRiders();
  }, []);

  useEffect(() => {
    const results = karitonRiders.filter(rider =>
      `${rider.firstName} ${rider.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRiders(results);
  }, [searchTerm, karitonRiders]);

  const handleCreateClick = () => {
    navigate('/admin/create-kariton-rider');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kariton Riders</h1>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaUserPlus />
            Create Kariton Rider Account
          </button>

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
            <div className="col-span-3">Municipality</div>
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
              <div className="col-span-3">{rider.municipality}</div>
              <div className="col-span-2">
                {rider.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="col-span-1">
                <FaRegIdCard className="text-blue-600 hover:text-blue-800" />
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
    </div>
  );
};

export default AdminKaritonService;