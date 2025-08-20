import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaUserCircle, FaCheck, FaTimes } from "react-icons/fa";

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const buttonBase = "py-2 px-2 bg-lime-600 text-white rounded-lg hover:bg-lime-600/75 hover:text-sky-900 transition cursor-pointer";

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/workers/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
          params: { t: Date.now() },
        });
        setWorker(res.data.worker);
        setStatusCode(null);
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchWorker();
  }, []);

  const handleProfileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");
      await axiosInstance.put("/api/workers/picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const refreshed = await axiosInstance.get("/api/workers/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() },
      });
      setWorker(refreshed.data.worker);
      setUploadStatus("success");
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const renderStatusPage = (title, message, buttonText, buttonAction, bgColor, textColor) => (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center px-4`}>
      <div className="bg-white p-6 shadow-lg max-w-sm text-center">
        <h2 className={`text-xl font-bold ${textColor} mb-2`}>{title}</h2>
        <p className="text-gray-700">{message}</p>
        <button onClick={buttonAction} className={buttonBase + " mt-4 w-full"}>
          {buttonText}
        </button>
      </div>
    </div>
  );

  if (statusCode === 410) {
    return renderStatusPage(
      "Registration Declined",
      "Your worker registration was declined. Please review and reapply.",
      "Re-register as Worker",
      async () => {
        try {
          const token = localStorage.getItem("token");
          await axiosInstance.delete("/api/workers/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {}
        navigate("/worker-registration");
      },
      "bg-red-100",
      "text-red-700"
    );
  }

  if (statusCode === 404) {
    return renderStatusPage(
      "Worker Profile Not Found",
      "You haven’t registered yet. Submit a worker application to get started.",
      "Go to Registration",
      () => navigate("/worker-registration"),
      "bg-orange-100",
      "text-orange-700"
    );
  }

  if (statusCode === 403) {
    return renderStatusPage(
      "Awaiting Verification",
      "Your application is under review. Please wait for approval.",
      "Back to Account",
      () => navigate("/account"),
      "bg-yellow-100",
      "text-yellow-700"
    );
  }

  if (!worker && !statusCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 text-sky-900 text-lg">
        Loading worker dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-sky-900 mb-4">Edit Profile</h3>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Change Profile Picture</label>
              <button onClick={handleProfileClick} className={buttonBase + " w-full"}>
                Change Picture
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureUpload}
                className="hidden"
                accept="image/*"
              />
              {uploading && <p className="text-sm text-gray-500 mt-2 text-center">Uploading picture...</p>}
              {uploadStatus === "success" && (
                <div className="flex items-center justify-center mt-2 text-lime-600">
                  <FaCheck className="mr-1" /> Picture uploaded successfully!
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center justify-center mt-2 text-red-600">
                  <FaTimes className="mr-1" /> Upload failed. Please try again.
                </div>
              )}
            </div>

            <button onClick={() => setShowEditModal(false)} className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white max-w-5xl w-full p-6 shadow-xl flex flex-col md:flex-row gap-6">
        {/* Profile Section */}
        <div className="md:w-[60%] w-full text-center bg-sky-50 p-4 relative">
          <button onClick={() => setShowEditModal(true)} className={buttonBase + " absolute top-4 right-4 px-3 py-1"}>
            Edit
          </button>

          <div>
            {worker.profilePicture === "default-profile.png" ? (
              <FaUserCircle className="w-32 h-32 mx-auto text-gray-500 mb-4 border-2 border-sky-900 rounded-full" />
            ) : (
              <img
                src={worker.profilePicture}
                alt="Profile"
                className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-sky-900 mb-4"
              />
            )}
          </div>

          <h2 className="text-2xl font-bold text-sky-900 mb-2">{worker.firstName} {worker.lastName}</h2>
          <p className="text-sm text-gray-600 mb-6">{worker.email}</p>

          <div className="text-left text-sm space-y-2 text-gray-700">
            <p><strong>Full Name:</strong> {worker.firstName} {worker.middleName} {worker.lastName}</p>
            <p><strong>Sex:</strong> {worker.sex}</p>
            <p><strong>Age:</strong> {worker.age}</p>
            <p><strong>Birthdate:</strong> {new Date(worker.birthdate).toLocaleDateString()}</p>
            <p><strong>Nationality:</strong> {worker.nationality}</p>
            <p><strong>Status:</strong> {worker.status}</p>
          </div>

          <button onClick={() => navigate("/account")} className={buttonBase + " mt-6 w-full"}>
            Back to Account
          </button>
        </div>

        {/* Quick Access Section */}
        <div className="md:w-[40%] w-full bg-emerald-50 p-4">
          <h3 className="text-xl font-semibold text-sky-900 mb-4 text-center">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "My Address", path: "/worker-address" },
              { label: "My Portfolio", path: "/worker/portfolio" },
              { label: "Pending Applications", path: "/jobs/job-application/pending" },
              { label: "Accepted Applications", path: "/jobs/job-application/waiting-to-confirm" },
              { label: "Ongoing Jobs", path: "/jobs/job-application/ongoing-jobs" },
              { label: "Contacts", path: "/worker-contacts" },
            ].map(({ label, path }) => (
              <button key={label} onClick={() => navigate(path)} className={buttonBase}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
