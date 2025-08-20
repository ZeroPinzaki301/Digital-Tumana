import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const EmployerOngoingJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOngoingJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/employer/jobs/applications/ongoing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data.ongoingJobs);
      } catch (error) {
        console.error('Error fetching ongoing jobs:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingJobs();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading ongoing jobs...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/employer-dashboard')}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold flex items-center gap-2"
        >
          <span className="text-xl">←</span>
          <span className="hidden sm:inline cursor-pointer">Back to Dashboard</span>
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Currently Employed Workers</h2>
      {applications.length === 0 ? (
        <p className="text-gray-500">You currently have no ongoing jobs.</p>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <OngoingJobCard key={app._id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};

const OngoingJobCard = ({ application }) => {
  const {
    _id: applicationId,
    jobId,
    applicantId,
    workerPortfolioId,
    status,
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

      {/* Status + Date */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(currentStatus)}`}>
          {currentStatus}
        </span>
        <span className="text-sm text-gray-500">Started on {new Date(createdAt).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons */}
      {currentStatus === 'ongoingJob' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/employer/job-application/applicant-details/${applicantId?._id}`)}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition cursor-pointer"
          >
            View Worker Details
          </button>
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={loading}
            className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition cursor-pointer"
          >
            Mark as Completed
          </button>
          <button
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition cursor-pointer"
          >
            Cancel Job
          </button>
        </div>
      )}
    </div>
  );
};

// Tailwind badge color helper
const getStatusBadgeColor = status => {
  switch (status) {
    case 'ongoingJob':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default EmployerOngoingJobs;