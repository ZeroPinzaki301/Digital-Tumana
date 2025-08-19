import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const PendingApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/job-applications/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data.pendingApplications || []);
      } catch (error) {
        console.error("Error fetching pending applications:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(`/api/job-applications/cancel/${selectedAppId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplications(prev => prev.filter(app => app._id !== selectedAppId));
      setShowModal(false);
      setSelectedAppId(null);
    } catch (error) {
      console.error("Error cancelling application:", error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading applications...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📄 Your Pending Job Applications</h2>
      {applications.length === 0 ? (
        <p className="text-gray-500">You have no pending applications.</p>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <ApplicationCard
              key={app._id}
              application={app}
              onCancel={() => {
                setSelectedAppId(app._id);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Cancel Application</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this application? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                No, Keep
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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

const ApplicationCard = ({ application, onCancel }) => {
  const { jobId, employerId, status, createdAt } = application;

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white">
      {/* Job Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={jobId.jobImage || "/default-job.png"}
          alt="Job"
          className="w-14 h-14 rounded-md object-cover"
        />
        <div>
          <h3 className="text-lg font-medium">{jobId.jobName}</h3>
          <p className="text-sm text-gray-500">{jobId.jobCode}</p>
          <p className="text-sm text-gray-600">
            ₱{jobId.minSalary.toLocaleString()} – ₱{jobId.maxSalary.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Employer Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Employer:</span> {employerId.companyName}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
          {status}
        </span>
        <span className="text-sm text-gray-500">Submitted: {new Date(createdAt).toLocaleDateString()}</span>
      </div>

      {/* Cancel Button */}
      <div className="mt-4 text-right">
        <button
          onClick={onCancel}
          className="text-sm text-red-600 hover:underline"
        >
          Cancel Application
        </button>
      </div>
    </div>
  );
};

const getStatusBadgeColor = status => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "hired":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default PendingApplicationsPage;