import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const MAX_IMAGE_SIZE_MB = 4;

const EmployerAddJob = () => {
  const [hasAddress, setHasAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    jobName: "",
    jobDescription: "",
    minSalary: "",
    maxSalary: "",
    salaryFrequency: "daily",
    jobCode: "",
    jobImage: "",
  });
  const [imageError, setImageError] = useState("");
  const [modalError, setModalError] = useState("");

  const navigate = useNavigate();
  const jobCodeRef = useRef(null);

  useEffect(() => {
    const checkAddress = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/employers/address", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.address) {
          setHasAddress(true);
        }
      } catch {
        setHasAddress(false);
      } finally {
        setLoading(false);
      }
    };
    checkAddress();
  }, []);

  const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (name === "jobImage") {
    const file = files[0];
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError("Main job image must be less than 4MB.");
      return;
    }
    setImageError("");
    setFormData({ ...formData, jobImage: file });
  } else {
    const transformedValue =
      name === "jobCode" && typeof value === "string" ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: transformedValue });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const min = parseFloat(formData.minSalary);
    const max = parseFloat(formData.maxSalary);

    if (min > max) {
      alert("Max salary must be greater than or equal to Min salary.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      await axiosInstance.post("/api/employer/jobs", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/employer-jobs");
    } catch (err) {
      console.error("Job creation failed:", err);
      if (
        err.response &&
        err.response.status === 500 &&
        err.response.data.error &&
        err.response.data.error.includes("duplicate key error")
      ) {
        setModalError("Job code is already used. Please choose a different one.");
      }
    }
  };

  const closeModal = () => {
    setModalError("");
    setTimeout(() => jobCodeRef.current?.focus(), 100);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!hasAddress) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-red-400">
          <h2 className="text-xl font-bold text-red-700 mb-2">No Employer Address Found</h2>
          <p className="text-gray-700 mb-4">
            You need to set up your employer address before posting a job.
          </p>
          <button
            onClick={() => navigate("/employer-address")}
            className="w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
          >
            ➕ Set Employer Address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-6 relative">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg border border-green-400">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Add New Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="jobName"
            placeholder="Job Name"
            value={formData.jobName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded font-bold"
          />
          <textarea
            name="jobDescription"
            placeholder="Job Description"
            value={formData.jobDescription}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded font-bold"
          />
          <div className="flex gap-4">
            <input
              type="number"
              name="minSalary"
              placeholder="Min Salary"
              value={formData.minSalary}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded font-bold"
            />
            <input
              type="number"
              name="maxSalary"
              placeholder="Max Salary"
              value={formData.maxSalary}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded font-bold"
            />
          </div>
          {parseFloat(formData.minSalary) > parseFloat(formData.maxSalary) && (
            <p className="text-red-600 text-sm font-bold">
              ⚠️ Max salary must be higher than Min salary.
            </p>
          )}
          <select
            name="salaryFrequency"
            value={formData.salaryFrequency}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded font-bold"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input
            ref={jobCodeRef}
            type="text"
            name="jobCode"
            placeholder="Job Code"
            value={formData.jobCode}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded font-bold uppercase"
          />
          <input
            type="file"
            name="jobImage"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded font-bold"
          />
          {imageError && <p className="text-red-600 text-sm font-bold">{imageError}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-bold"
          >
            ✅ Post Job
          </button>
        </form>
      </div>

      {modalError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-red-400">
            <h3 className="text-lg font-bold text-red-700 mb-2">🚫 Job Code Error</h3>
            <p className="text-gray-800 font-semibold mb-4">{modalError}</p>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-bold"
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerAddJob;