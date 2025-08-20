import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const EmployerEditJob = () => {
  const { jobId } = useParams();
  const [formData, setFormData] = useState({
    jobName: "",
    jobDescription: "",
    minSalary: "",
    maxSalary: "",
    salaryFrequency: "daily",
    jobCode: "",
    isAvailable: true,
  });

  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/api/employer/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = res.data.job;
        setFormData({
          jobName: j.jobName,
          jobDescription: j.jobDescription,
          minSalary: j.minSalary,
          maxSalary: j.maxSalary,
          salaryFrequency: j.salaryFrequency,
          jobCode: j.jobCode,
          isAvailable: j.isAvailable,
        });
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const transformedValue =
      name === "jobCode" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: transformedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axiosInstance.put(`/api/employer/jobs/${jobId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/employer-job/${jobId}`);
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  const toggleAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      isAvailable: !prev.isAvailable,
    }));
  };

  if (statusCode === 404) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-400 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">Job Not Found</h2>
          <p className="text-gray-700 mb-4">This job may have been deleted.</p>
          <button
            onClick={() => navigate("/employer-jobs")}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-100 flex items-center justify-center text-sky-900 text-lg">
        Loading job info...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-6">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-md p-6 border border-sky-900">
        <h2 className="text-2xl font-bold text-sky-900 mb-4 text-center">Edit Job</h2>

        <p className="text-center font-semibold text-sm text-sky-900 mb-4">
          Status: {formData.isAvailable ? "🟢 Open" : "🔴 Closed"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jobName" className="block text-sm font-medium text-sky-900 mb-1">Job Name</label>
            <input
              id="jobName"
              type="text"
              name="jobName"
              value={formData.jobName}
              onChange={handleChange}
              required
              className="input font-bold uppercase"
            />
          </div>

          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-sky-900 mb-1">Job Description</label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              required
              className="input font-bold uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minSalary" className="block text-sm font-medium text-sky-900 mb-1">Min Salary (₱)</label>
              <input
                id="minSalary"
                type="number"
                name="minSalary"
                value={formData.minSalary}
                onChange={handleChange}
                required
                className="input font-bold"
              />
            </div>

            <div>
              <label htmlFor="maxSalary" className="block text-sm font-medium text-sky-900 mb-1">Max Salary (₱)</label>
              <input
                id="maxSalary"
                type="number"
                name="maxSalary"
                value={formData.maxSalary}
                onChange={handleChange}
                required
                className="input font-bold"
              />
            </div>
          </div>

          <div>
            <label htmlFor="salaryFrequency" className="block text-sm font-medium text-sky-900 mb-1">Salary Frequency</label>
            <select
              id="salaryFrequency"
              name="salaryFrequency"
              value={formData.salaryFrequency}
              onChange={handleChange}
              className="input font-bold uppercase"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label htmlFor="jobCode" className="block text-sm font-medium text-sky-900 mb-1">Job Code</label>
            <input
              id="jobCode"
              type="text"
              name="jobCode"
              value={formData.jobCode}
              readOnly
              className="input font-bold uppercase bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition font-bold cursor-pointer"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => navigate(`/employer-job/${jobId}`)}
            className="w-full py-2 mt-2 bg-gray-200 text-sky-900 rounded-lg hover:bg-gray-300 transition font-bold cursor-pointer"
          >
            Cancel
          </button>
        </form>

        <button
          type="button"
          onClick={toggleAvailability}
          className={`w-full py-2 mt-4 rounded-lg transition font-bold ${
            formData.isAvailable
              ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
          }`}
        >
          {formData.isAvailable ? "Close Job" : "Reopen Job"}
        </button>
      </div>
    </div>
  );
};

export default EmployerEditJob;