import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const PendingEmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/employer/jobs/applications/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data.applications);
      } catch (error) {
        console.error('Error fetching pending applications:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading applications...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Back Button Section */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employer-dashboard')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold flex items-center gap-2 cursor-pointer"
        >
          <span className="text-xl">←</span>
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Pending Job Applications</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500">You have no pending applications.</p>
        ) : (
          <div className="space-y-6">
            {applications.map(app => (
              <ApplicationCard 
                key={app._id} 
                application={app} 
                onStatusUpdate={(id, newStatus) => {
                  // Update the application status in the parent state
                  setApplications(prev => prev.map(item => 
                    item._id === id ? {...item, status: newStatus} : item
                  ));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationCard = ({ application, onStatusUpdate }) => {
  const {
    _id: applicationId,
    jobId,
    applicantId,
    workerPortfolioId,
    status,
    createdAt
  } = application;

  const [currentStatus, setCurrentStatus] = useState(status);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate minimum date (today) and time for the input constraints
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().substring(0, 5);

  const handleStatusUpdate = async (newStatus, interviewDateTime = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const requestBody = { status: newStatus };
      if (interviewDateTime) {
        requestBody.interviewDate = interviewDateTime;
      }
      
      await axiosInstance.put(
        `/api/employer/jobs/application/${applicationId}/status`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentStatus(newStatus);
      onStatusUpdate(applicationId, newStatus);
      
      if (newStatus === 'workerConfirmation') {
        setShowInterviewModal(false);
      }
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWithInterview = () => {
    // Reset the interview date and time when opening the modal
    setInterviewDate('');
    setInterviewTime('09:00');
    setShowInterviewModal(true);
  };

  const confirmInterview = () => {
    if (!interviewDate) {
      alert('Please select an interview date');
      return;
    }
    
    // Combine date and time into a single Date object
    const interviewDateTime = new Date(`${interviewDate}T${interviewTime}`);
    handleStatusUpdate('workerConfirmation', interviewDateTime);
  };

  return (
    <>
      <div className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition">
        {/* Applicant Info */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={applicantId?.profilePicture || '/default-profile.png'}
            alt="Applicant"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-medium">
              {applicantId?.firstName} {applicantId?.lastName}
            </h3>
            <p className="text-sm text-gray-500">{applicantId?.email}</p>
          </div>
        </div>

        {/* Job Info */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={jobId?.jobImage || '/default-job.png'}
            alt="Job"
            className="w-14 h-14 rounded-md object-cover"
          />
          <div>
            <p className="font-medium">{jobId?.jobName || 'Unnamed Job'}</p>
            <p className="text-sm text-gray-600">Code: {jobId?.jobCode}</p>
            <p className="text-sm text-gray-600">
              Salary: ₱{jobId?.minSalary} - ₱{jobId?.maxSalary}
            </p>
          </div>
        </div>

        {/* Portfolio Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Skills: {workerPortfolioId?.skillTypes?.join(', ') || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            Portfolio Status: {workerPortfolioId?.portfolioStatus || 'N/A'}
          </p>
        </div>

        {/* Status + Date */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(currentStatus)}`}>
            {currentStatus}
          </span>
          <span className="text-sm text-gray-500">Applied on {new Date(createdAt).toLocaleDateString()}</span>
        </div>

        {/* Action Buttons */}
        {currentStatus === 'pending' && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/employer/job-application/applicant-details/${applicantId?._id}`)}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition cursor-pointer"
            >
              View Worker Details
            </button>
            <button
              onClick={handleAcceptWithInterview}
              disabled={loading}
              className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition cursor-pointer"
            >
              Accept
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={loading}
              className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition cursor-pointer"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Interview Date Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Schedule Interview</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Date
              </label>
              <input
                type="date"
                min={today}
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Time
              </label>
              <input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmInterview}
                disabled={loading || !interviewDate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Confirm Interview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Tailwind badge color helper
const getStatusBadgeColor = status => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'workerConfirmation':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default PendingEmployerApplications;