import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const WorkerOngoingJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/job-applications/worker-ongoing', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error('Error fetching ongoing jobs:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading ongoing jobs...
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white border border-sky-700 rounded-md shadow hover:bg-sky-100 cursor-pointer text-sky-800 font-medium transition"
        >
          ← Back
        </button>
      </div>

      {/* Heading */}
      <h2 className="text-xl sm:text-2xl text-sky-800 font-semibold text-center mb-6">
        Your Ongoing Jobs
      </h2>

      {applications.length === 0 ? (
        <p className="text-gray-500 text-center">
          You currently have no ongoing jobs.
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
  const { _id: id, jobId, employerId, status, createdAt } = application;
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/jobs/job-application/ongoing-job/${id}`);
  };

  const handleTerminate = async (e) => {
    e.stopPropagation(); // Prevent card click
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.patch(
        `/api/job-applications/terminate/${id}`,
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
    <div
      className="border border-sky-700 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Employer Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
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

      {/* Status + Date */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-2 sm:gap-0">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(currentStatus)}`}
        >
          {currentStatus}
        </span>
        <span className="text-sm text-gray-500">
          Started on {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Terminate Button */}
      {currentStatus === 'ongoingJob' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            disabled={loading}
            className="px-4 py-2 bg-red-100 shadow-sm border border-red-700 cursor-pointer text-red-800 rounded hover:bg-red-200 transition"
          >
            Terminate Job
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Termination</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to terminate this job? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
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

const getStatusBadgeColor = (status) => {
  const colors = {
    workerConfirmation: 'bg-blue-100 text-blue-800',
    ongoingJob: 'bg-green-100 text-green-800',
    terminated: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default WorkerOngoingJobs;
