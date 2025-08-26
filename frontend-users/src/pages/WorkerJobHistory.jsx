import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const WorkerJobHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/api/job-applications/worker-history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error('Error fetching job history:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading job history...
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={() => navigate('/services')}
          className="px-4 py-2 bg-white border border-sky-700 rounded-md shadow hover:bg-sky-100 cursor-pointer text-sky-800 font-medium transition"
        >
          ← Back to Services
        </button>
      </div>

      {/* Heading */}
      <h2 className="text-xl sm:text-2xl text-sky-800 font-semibold text-center mb-6">
        Your Job History
      </h2>

      {applications.length === 0 ? (
        <p className="text-gray-500 text-center">
          You currently have no completed or terminated jobs.
        </p>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <HistoryCard key={app._id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryCard = ({ application }) => {
  const { jobId, employerId, status, createdAt } = application;

  return (
    <div className="border border-sky-700 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition">
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
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}
        >
          {status}
        </span>
        <span className="text-sm text-gray-500">
          Started on {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const getStatusBadgeColor = (status) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    terminated: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default WorkerJobHistory;
