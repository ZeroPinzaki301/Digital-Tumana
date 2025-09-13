import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const AdminTesdaEnrollmentDetail = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [error, setError] = useState('');

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
    const fetchEnrollment = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axiosInstance.get(`/api/admin/tesda/enrollments/${enrollmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnrollment(res.data.enrollment);
      } catch (err) {
        setError('Failed to fetch enrollment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [enrollmentId]);

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axiosInstance.put(
        `/api/admin/tesda/enrollments/${enrollmentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnrollment((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-red-600 text-lg mb-4">{error || 'Enrollment not found.'}</p>
        <button
          onClick={() => navigate('/admin/tesda/enrollment/pending')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to List
        </button>
      </div>
    );
  }

  const renderActions = () => {
    const status = enrollment.status;
    const actions = {
      pending: ['eligible', 'cancelled'],
      eligible: ['reserved', 'cancelled'],
      reserved: ['enrolled', 'cancelled'],
      enrolled: ['graduated', 'cancelled']
    };

    if (actions[status]) {
      return (
        <div className="flex gap-4 mt-4">
          {actions[status].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusUpdate(s)}
              disabled={statusUpdating}
              className={`px-4 py-2 rounded ${
                s === 'cancelled' ? 'bg-red-600' : 'bg-green-600'
              } text-white hover:opacity-90`}
            >
              Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      );
    }

    if (status === 'graduated') {
      return (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-green-700 mb-2">🎓 This person is a certified Tumana Bachelor!</h3>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enrollment Detail</h2>

        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><strong>Name:</strong> {enrollment.firstName} {enrollment.lastName}</p>
          <p><strong>Email:</strong> {enrollment.userId?.email || 'N/A'}</p>
          <p><strong>Age:</strong> {calculateAge(enrollment.birthdate)}</p>
          <p><strong>Birthdate:</strong> {new Date(enrollment.birthdate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {enrollment.status}</p>
          <p><strong>Submitted:</strong> {new Date(enrollment.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Uploaded Documents</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Birth Certificate</p>
              <img
                src={enrollment.birthCertImage}
                alt="Birth Certificate"
                className="w-full h-64 object-cover rounded border"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Valid ID</p>
              <img
                src={enrollment.validIdImage}
                alt="Valid ID"
                className="w-full h-64 object-cover rounded border"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Secondary ID</p>
              <img
                src={enrollment.secondValidIdImage}
                alt="Secondary ID"
                className="w-full h-64 object-cover rounded border"
              />
            </div>
          </div>
        </div>

        {renderActions()}

        <button
          onClick={() => navigate(`/admin/tesda/enrollment/${enrollment.status}`)}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)} List
        </button>
      </div>
    </div>
  );
};

export default AdminTesdaEnrollmentDetail;