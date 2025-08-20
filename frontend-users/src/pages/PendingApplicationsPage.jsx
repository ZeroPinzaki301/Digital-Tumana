import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const PendingApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const navigate = useNavigate();

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
      await axiosInstance.put(
        `/api/job-applications/cancel/${selectedAppId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) => prev.filter((app) => app._id !== selectedAppId));
      setShowModal(false);
      setSelectedAppId(null);
    } catch (error) {
      console.error("Error cancelling application:", error.message);
    }
  };

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
          className="px-4 py-2 bg-white border border-sky-800 rounded-md shadow hover:bg-sky-100 cursor-pointer text-sky-800 font-medium transition"
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

      {showModal && (
        <Modal
          title="Cancel Application"
          description="Are you sure you want to cancel this application? This action cannot be undone."
          onConfirm={handleCancel}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const ApplicationCard = ({ application, onCancel }) => {
  const { jobId, employerId, status, createdAt } = application;

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition">
      {/* Job Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={jobId.jobImage || "/default-job.png"}
          alt="Job"
          className="w-14 h-14 rounded-md object-cover"
        />
        <div className="flex-1">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-2 sm:gap-0">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
            status
          )}`}
        >
          {status}
        </span>
        <span className="text-sm text-gray-500">
          Submitted: {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Cancel Button */}
      <div className="mt-4 text-right">
        <button
          onClick={onCancel}
          className="text-sm text-red-600 bg-red-100 py-2 px-4 rounded border border-red-700 cursor-pointer shadow-sm hover:bg-red-200 transition"
        >
          Cancel Application
        </button>
      </div>
    </div>
  );
};

const Modal = ({ title, description, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          No, Keep
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);

const getStatusBadgeColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    hired: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-200 text-gray-600",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default PendingApplicationsPage;