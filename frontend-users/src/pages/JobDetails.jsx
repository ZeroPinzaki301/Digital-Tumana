import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [worker, setWorker] = useState(null);
  const [portfolioStatus, setPortfolioStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axiosInstance.get(`/api/jobs/${jobId}`);
        setJob(res.data.job);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };

    const checkWorkerStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const [workerRes, portfolioRes] = await Promise.all([
          axiosInstance.get("/api/workers/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get("/api/worker/portfolio/status", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setWorker(workerRes.data.worker);
        setPortfolioStatus(portfolioRes.data.portfolioStatus);
      } catch {
        setWorker(null);
        setPortfolioStatus(null);
      }
    };

    fetchJob();
    checkWorkerStatus();
  }, [jobId]);

  if (statusCode === 404 || !job) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-400 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">Job Not Found</h2>
          <p className="text-gray-700 mb-4">This job may have been deleted or never existed.</p>
          <button
            onClick={() => navigate("/services")}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const canApply = worker && job.isAvailable && portfolioStatus === "available";

  return (
    <div className="min-h-screen bg-emerald-50 px-4 py-6 flex justify-center">
      <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-md border border-sky-900">
        <button
          onClick={() => navigate("/services")}
          className="mb-6 py-2 px-4 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition"
        >
          ⬅ Back to Jobs
        </button>

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

          <div className="text-left text-sm space-y-2 text-gray-800 mb-6">
            <p><strong>Job Code:</strong> {job.jobCode}</p>
            <p><strong>Description:</strong> {job.jobDescription}</p>
            <p><strong>Created:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Application Button Logic */}
          {canApply ? (
            <button
              onClick={() => navigate(`/jobs/job-application/${job._id}`)}
              className="w-full py-2 bg-sky-600 text-white rounded hover:bg-sky-500 transition"
            >
              Apply for this Job
            </button>
          ) : worker ? (
            portfolioStatus === "unavailable" ? (
              <div className="w-full py-2 text-center bg-orange-100 text-orange-700 rounded border border-orange-300 font-semibold">
                ⚠️ Your portfolio is marked as unavailable
              </div>
            ) : (
              <div className="w-full py-2 text-center bg-yellow-100 text-yellow-700 rounded border border-yellow-300 font-semibold">
                ⚠️ This job is currently closed
              </div>
            )
          ) : (
            <div className="w-full py-2 text-center bg-gray-100 text-gray-500 rounded border border-gray-300 font-semibold">
              🚫 Only verified workers can apply
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
