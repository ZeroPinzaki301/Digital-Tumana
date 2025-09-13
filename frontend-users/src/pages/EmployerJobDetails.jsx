import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const EmployerJobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/api/employer/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(res.data.job);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this job?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/employer/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/employer-jobs");
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  if (statusCode === 404 || !job) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-400 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">Job Not Found</h2>
          <p className="text-gray-700 mb-4">This job may have been deleted or never existed.</p>
          <button
            onClick={() => navigate("/employer-jobs")}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition cursor-pointer"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-4 py-6 flex justify-center">
      <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-md border border-sky-900">
        {/* Top Controls */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => navigate("/employer-jobs")}
            className="py-2 px-4 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition cursor-pointer"
          >
            ⬅ Back to Jobs
          </button>
          <div className="space-x-3">
            <button
              onClick={() => navigate(`/employer-edit-job/${job._id}`)}
              className="py-2 px-4 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Job Content */}
        <div className="text-center">
          <img
            src={job.jobImage}
            alt={job.jobName}
            className="w-full max-w-md mx-auto rounded-lg object-cover mb-4"
          />
          <h2 className="text-2xl font-bold text-sky-900 mb-2">{job.jobName}</h2>
          <p className="text-sm text-gray-700 mb-6">
            <strong>₱{job.minSalary} - ₱{job.maxSalary}</strong> / {job.salaryFrequency} |{" "}
            <strong>Status:</strong>{" "}
            <span className={job.isAvailable ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
              {job.isAvailable ? "Open" : "Closed"}
            </span>
          </p>

          <div className="text-left text-sm space-y-2 text-gray-800">
            <p><strong>Job Code:</strong> {job.jobCode}</p>
            <p><strong>Description:</strong> {job.jobDescription}</p>
            <p><strong>Created:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobDetail;