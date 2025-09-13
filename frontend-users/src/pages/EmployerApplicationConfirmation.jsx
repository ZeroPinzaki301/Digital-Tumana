import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ConfirmationEmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/employer/jobs/applications/confirmation', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data.applications);
      } catch (error) {
        console.error('Error fetching waiting to confirm applications:', error.message);
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
        <h2 className="text-2xl font-semibold mb-4">To Interview Job Applications</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500">You have no pending interview applications.</p>
        ) : (
          <div className="space-y-6">
            {applications.map(app => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationCard = ({ application }) => {
  const {
    _id: applicationId,
    jobId,
    applicantId,
    workerPortfolioId,
    status,
    interviewDate,
    createdAt
  } = application;

  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        `/api/employer/jobs/application/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error.message);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(currentStatus)}`}>
          {currentStatus}
        </span>
        <span className="text-sm text-gray-500">Applied on {new Date(createdAt).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons */}
      {currentStatus === 'workerConfirmation' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/employer/job-application/applicant-details/${applicantId?._id}`)}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition cursor-pointer"
          >
            View Worker Details
          </button>
          <button
            onClick={() => handleStatusUpdate('ongoingJob')}
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

export default ConfirmationEmployerApplications;