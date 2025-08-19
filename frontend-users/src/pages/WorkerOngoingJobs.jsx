import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const WorkerOngoingJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/job-applications/worker-ongoing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data.applications);
      } catch (error) {
        console.error('Error fetching ongoing jobs:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading ongoing jobs...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🛠️ Your Ongoing Jobs</h2>
      {applications.length === 0 ? (
        <p className="text-gray-500">You currently have no ongoing jobs.</p>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};

const ApplicationCard = ({ application }) => {
  const {
    _id: applicationId,
    jobId,
    employerId,
    status,
    createdAt
  } = application;

  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleTerminate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axiosInstance.patch(
        `/api/job-applications/terminate/${applicationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentStatus('terminated');
    } catch (error) {
      console.error('Error terminating job:', error.message);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition">
      {/* Employer Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={employerId?.profilePicture || '/default-profile.png'}
          alt="Employer"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
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
        <div>
          <p className="font-medium">{jobId?.jobName || 'Unnamed Job'}</p>
          <p className="text-sm text-gray-600">Code: {jobId?.jobCode}</p>
          <p className="text-sm text-gray-600">
            Salary: ₱{jobId?.minSalary} - ₱{jobId?.maxSalary}
          </p>
        </div>
      </div>

      {/* Status + Date */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(currentStatus)}`}>
          {currentStatus}
        </span>
        <span className="text-sm text-gray-500">Started on {new Date(createdAt).toLocaleDateString()}</span>
      </div>

      {/* Terminate Button */}
      {currentStatus === 'ongoingJob' && (
        <div className="mt-4">
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
          >
            Terminate Job
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Termination</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to terminate this job? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
              >
                No, Go Back
              </button>
              <button
                onClick={handleTerminate}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Yes, Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tailwind badge color helper
const getStatusBadgeColor = status => {
  switch (status) {
    case 'workerConfirmation':
      return 'bg-blue-100 text-blue-800';
    case 'ongoingJob':
      return 'bg-green-100 text-green-800';
    case 'terminated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default WorkerOngoingJobs;