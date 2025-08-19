import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

const JobApplicationPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    const fetchJobDetailsAndCheck = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch job details
        const jobRes = await axiosInstance.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobData = jobRes.data.job;
        setJob(jobData);

        // Check if user already applied
        const checkRes = await axiosInstance.get(`/api/job-applications/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appliedJobIds = checkRes.data.appliedJobIds || [];

        if (appliedJobIds.includes(jobData._id)) {
          setAlreadyApplied(true);
          setFeedback("You’ve already applied to this job.");
        }
      } catch (err) {
        console.error("Error loading job or checking application:", err);
        setFeedback("Unable to load job or check application status.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetailsAndCheck();
  }, [jobId]);

  const handleApply = async () => {
    setSubmitting(true);
    setFeedback("");

    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `/api/job-applications/apply/${jobId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFeedback(res.data.message || "Application submitted successfully");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to apply for job";
      setFeedback(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Apply to Job</h2>

      {job ? (
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold text-gray-700">{job.jobName}</h3>
          <p><span className="font-medium text-gray-600">Description:</span> {job.jobDescription}</p>
          <p>
            <span className="font-medium text-gray-600">Salary:</span>{" "}
            ₱{job.minSalary} – ₱{job.maxSalary}{" "}
            <span className="text-sm text-gray-500">({job.salaryFrequency})</span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Status:</span>{" "}
            <span className={job.isAvailable ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
              {job.isAvailable ? "Open" : "Closed"}
            </span>
          </p>
          <p><span className="font-medium text-gray-600">Job Code:</span> {job.jobCode}</p>
          <img
            src={job.jobImage}
            alt="Job"
            className="w-full max-h-80 object-cover rounded-md mt-4"
          />
        </div>
      ) : (
        <p className="text-red-500">Job not found.</p>
      )}

      <button
        onClick={handleApply}
        disabled={submitting || alreadyApplied || !job?.isAvailable}
        className={`w-full py-3 px-6 rounded-md text-white font-medium transition ${
          submitting || alreadyApplied || !job?.isAvailable
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {submitting
          ? "Submitting..."
          : alreadyApplied
          ? "Already Applied"
          : !job?.isAvailable
          ? "Job Closed"
          : "Confirm Application"}
      </button>

      {feedback && (
        <div
          className={`mt-6 p-4 rounded-md text-sm ${
            feedback.includes("successfully")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};

export default JobApplicationPage;