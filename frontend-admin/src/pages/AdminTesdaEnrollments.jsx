import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaSearch, FaRegIdCard } from 'react-icons/fa';

const statusOptions = ['pending', 'eligible', 'reserved', 'enrolled', 'graduated'];

const AdminTesdaEnrollments = () => {
  const { status } = useParams();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get(`/api/admin/tesda/enrollments/status/${status}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnrollments(response.data.enrollments);
        setFilteredEnrollments(response.data.enrollments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching TESDA enrollments:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [status]);

  useEffect(() => {
    const results = enrollments.filter(enrollee =>
      `${enrollee.firstName} ${enrollee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEnrollments(results);
  }, [searchTerm, enrollments]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* 🔘 Status Navigation */}
        <div className="mb-6 flex gap-4">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => navigate(`/admin/tesda/enrollment/${s}`)}
              className={`px-4 py-2 rounded ${
                s === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              } hover:bg-blue-500 hover:text-white`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* 🏷️ Page Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {status.charAt(0).toUpperCase() + status.slice(1)} Enrollments
        </h1>

        {/* 🔍 Search Bar */}
        <div className="mb-6 relative w-1/2">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 📋 Enrollment List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Age</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {filteredEnrollments.map(enrollee => (
            <div
              key={enrollee._id}
              className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/admin/tesda/enrollment/detail/${enrollee._id}`)}
            >
              <div className="col-span-3 font-medium text-blue-600">
                {enrollee.firstName} {enrollee.lastName}
              </div>
              <div className="col-span-3">{enrollee.userId?.email || 'N/A'}</div>
              <div className="col-span-2">{enrollee.age}</div>
              <div className="col-span-2 capitalize">{enrollee.status}</div>
              <div className="col-span-2">
                <FaRegIdCard className="text-blue-600 hover:text-blue-800" />
              </div>
            </div>
          ))}

          {filteredEnrollments.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No enrollees match your search.' : 'No TESDA enrollments found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTesdaEnrollments;