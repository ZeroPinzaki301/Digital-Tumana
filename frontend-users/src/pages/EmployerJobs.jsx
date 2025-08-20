import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const EmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/employer/jobs", {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // bust cache
        });
        setJobs(res.data);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchJobs();
  }, []);

  if (statusCode === 404 || jobs.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-yellow-400">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">No Jobs Posted</h2>
          <p className="text-gray-700 mb-4">You haven’t posted any jobs yet.</p>
          <button
            onClick={() => navigate("/employer-add-job")}
            className="w-full py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 transition"
          >
            ➕ Add Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/employer-dashboard")}
          className="py-2 px-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition cursor-pointer"
        >
          ⬅ Back to Dashboard
        </button>
        <button
          onClick={() => navigate("/employer-add-job")}
          className="py-2 px-4 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition cursor-pointer"
        >
          Add Job
        </button>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job._id} className="bg-white rounded-lg shadow-md border border-blue-800 overflow-hidden">
            <img
              src={job.jobImage}
              alt={job.jobName}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-xl font-bold text-blue-900">{job.jobName}</h3>
              <p className="text-gray-700 text-sm">
                <strong>Description:</strong> {job.jobDescription}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Salary:</strong> ₱{job.minSalary} – ₱{job.maxSalary} ({job.salaryFrequency})
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Status:</strong>{" "}
                <span className={job.isAvailable ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                  {job.isAvailable ? "Open" : "Closed"}
                </span>
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Code:</strong> {job.jobCode}
              </p>

              <button
                onClick={() => navigate(`/employer-job/${job._id}`)}
                className="mt-3 w-full py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition cursor-pointer"
              >
                View / Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployerJobs;