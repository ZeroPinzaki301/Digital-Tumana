import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const MAX_IMAGE_SIZE_MB = 4;

const EmployerEditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [hasAddress, setHasAddress] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState(null);
  const [imageError, setImageError] = useState("");
  const [modalError, setModalError] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  const [formData, setFormData] = useState({
    jobName: "",
    jobDescription: "",
    minSalary: "",
    maxSalary: "",
    salaryFrequency: "daily",
    skillTypes: [],
    jobImage: null,
    isAvailable: true,
  });

  const skillOptions = [
    "Plants",
    "Fertilizers",
    "Animals",
    "Machinery",
    "Irrigation",
    "Harvesting",
    "Storage",
    "Other"
  ];

  // ✅ First useEffect: check address
  useEffect(() => {
    const checkAddress = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/employers/address", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data.address) {
          setHasAddress(false);
        }
      } catch {
        setHasAddress(false);
      }
    };
    checkAddress();
  }, []);

  // ✅ Second useEffect: fetch job only if address exists
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
          skillTypes: j.skillTypes || [],
          jobImage: null,
          isAvailable: j.isAvailable,
        });
        setOriginalImage(j.jobImage || "");
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hasAddress) {
      fetchJob();
    } else {
      setLoading(false); // Stop loading even if no address
    }
  }, [hasAddress, jobId]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === "jobImage") {
      const file = files[0];
      if (file && file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setImageError("Main job image must be less than 4MB.");
        return;
      }
      setImageError("");
      setFormData({ ...formData, jobImage: file });
    } else if (name.startsWith("skill-")) {
      const skill = name.replace("skill-", "");
      setFormData(prev => {
        const updatedSkills = checked
          ? [...prev.skillTypes, skill]
          : prev.skillTypes.filter(s => s !== skill);
        return { ...prev, skillTypes: updatedSkills };
      });
    } else {
      setFormData({ ...formData, [name]: value });
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

    if (formData.skillTypes.length === 0) {
      alert("Please select at least one skill type.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();

      payload.append("jobName", formData.jobName);
      payload.append("jobDescription", formData.jobDescription);
      payload.append("minSalary", formData.minSalary);
      payload.append("maxSalary", formData.maxSalary);
      payload.append("salaryFrequency", formData.salaryFrequency);
      payload.append("isAvailable", formData.isAvailable);
      payload.append("skillTypes", JSON.stringify(formData.skillTypes));

      if (formData.jobImage) {
        payload.append("jobImage", formData.jobImage);
      }

      await axiosInstance.put(`/api/employer/jobs/${jobId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/employer-job/${jobId}`);
    } catch (err) {
      console.error("Job update failed:", err);
      if (err.response?.status === 404) {
        setModalError("Job not found. It may have been deleted.");
      } else {
        setModalError("Failed to update job. Please try again.");
      }
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const newAvailability = !formData.isAvailable;

      await axiosInstance.patch(`/api/employer/jobs/${jobId}/availability`,
        { isAvailable: newAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFormData(prev => ({ ...prev, isAvailable: newAvailability }));
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      setModalError("Failed to update job availability. Please try again.");
    }
  };

  const closeModal = () => setModalError("");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!hasAddress) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-red-400">
          <h2 className="text-xl font-bold text-red-700 mb-2">No Employer Address Found</h2>
          <p className="text-gray-700 mb-4">
            You need to set up your employer address before editing a job.
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

  return (
    <div className="min-h-screen bg-green-50 px-4 py-6 relative">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg border border-green-400">
        <button
          onClick={() => navigate(`/employer-job/${jobId}`)}
          className="mb-4 px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600/75 cursor-pointer transition font-bold"
        >
          ← Back to Job Details
        </button>

        <h2 className="text-2xl font-bold text-sky-900 mb-4">Edit Job</h2>

        <p className="text-center font-semibold text-sm text-sky-900 mb-4">
          Status: {formData.isAvailable ? "🟢 Open" : "🔴 Closed"}
        </p>

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
          
          {/* Skill Types Checkboxes */}
          <div className="border rounded p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Required Skills *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {skillOptions.map(skill => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`skill-${skill}`}
                    checked={formData.skillTypes.includes(skill)}
                    onChange={handleChange}
                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm font-bold text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
            {formData.skillTypes.length === 0 && (
              <p className="text-red-600 text-sm font-bold mt-2">
                Please select at least one skill type
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Job Image
            </label>
            {originalImage && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img 
                  src={originalImage} 
                  alt="Current job" 
                  className="h-32 object-cover rounded border"
                />
              </div>
            )}
            <input
              type="file"
              name="jobImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded font-bold"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.jobImage ? `New image selected: ${formData.jobImage.name}` : "Leave empty to keep current image"}
            </p>
            {imageError && <p className="text-red-600 text-sm font-bold">{imageError}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 cursor-pointer transition font-bold"
          >
            Save Changes
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

      {modalError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-red-400">
            <h3 className="text-lg font-bold text-red-700 mb-2">🚫 Error</h3>
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

export default EmployerEditJob;