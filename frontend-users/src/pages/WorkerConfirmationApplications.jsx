import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const WorkerConfirmationApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/job-applications/worker-confirmation', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white border border-sky-800 cursor-pointer hover:bg-sky-100 text-gray-700 font-medium rounded-lg shadow transition"
        >
          ← Back
        </button>
      </div>

      {/* Centered Heading */}
      <h2 className="text-xl sm:text-2xl font-semibold text-sky-800 text-center mb-6">
        Applications Awaiting Your Confirmation
      </h2>

      {applications.length === 0 ? (
        <p className="text-gray-500 text-center">
          You have no applications awaiting confirmation.
        </p>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};

const ApplicationCard = ({ application }) => {
  const { _id: id, jobId, employerId, status, interviewDate, createdAt } = application;
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/jobs/job-application/ongoing-job/${id}`);
  };

  const handleStatusUpdate = async (e) => {
    if (e) e.stopPropagation(); // Prevent card click when button is clicked
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/job-applications/cancel/${id}`;
      const newStatus = 'cancelled';

      await axiosInstance.put(
        endpoint,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentStatus(newStatus);
    } catch (error) {
      console.error(`Error updating status:`, error.message);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const openModal = (type, e) => {
    if (e) e.stopPropagation(); // Prevent card click when button is clicked
    setActionType(type);
    setShowModal(true);
  };

  // Format the interview date for display
  const formatInterviewDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Employer Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={employerId?.profilePicture || '/default-profile.png'}
          alt="Employer"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-medium">
            {employerId?.firstName} {employerId?.lastName}
          </h3>
          <p className="text-sm text-gray-500">{employerId?.email}</p>
          <p className="text-sm text-gray-500">{employerId?.companyName}</p>
        </div>
      </div>

      {/* Job Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={jobId?.jobImage || '/default-job.png'}
          alt="Job"
          className="w-14 h-14 rounded-md object-cover"
        />
        <div className="flex-1">
          <p className="font-medium">{jobId?.jobName || 'Unnamed Job'}</p>
          <p className="text-sm text-gray-600">Code: {jobId?.jobCode}</p>
          <p className="text-sm text-gray-600">
            Salary: ₱{jobId?.minSalary} - ₱{jobId?.maxSalary}
          </p>
        </div>
      </div>

      {/* Interview Date */}
      {interviewDate && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Scheduled Interview</h4>
          <p className="text-sm text-blue-600">
            {formatInterviewDate(interviewDate)}
          </p>
        </div>
      )}

      {/* Status + Date */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-2 sm:gap-0">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
            currentStatus
          )}`}
        >
          {currentStatus}
        </span>
        <span className="text-sm text-gray-500">
          Received on {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons - Only show Cancel button now */}
      {currentStatus === 'workerConfirmation' && (
        <div className="mt-4 flex flex-wrap gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => openModal('cancel', e)}
            disabled={loading}
            className="px-4 py-2 bg-red-100 cursor-pointer shadow-lg border border-red-300 text-red-800 rounded hover:bg-red-200 transition"
          >
            Cancel Application
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Cancellation
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this application?
              {interviewDate && (
                <span className="block mt-2 text-red-600 font-medium">
                  Note: You have an interview scheduled for {formatInterviewDate(interviewDate)}
                </span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
              >
                No, Go Back
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tailwind badge color helper
const getStatusBadgeColor = (status) => {
  const colors = {
    workerConfirmation: 'bg-blue-100 text-blue-800',
    ongoingJob: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default WorkerConfirmationApplications;