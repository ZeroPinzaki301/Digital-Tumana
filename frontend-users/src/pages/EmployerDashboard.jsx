import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaUserCircle, FaCheck, FaTimes, FaEdit, FaBell } from "react-icons/fa";

const EmployerDashboard = () => {
  const [employer, setEmployer] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasPendingApplications, setHasPendingApplications] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const buttonBase = "relative p-4 bg-white border border-lime-100 rounded-xl shadow hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 group";

  useEffect(() => {
    const fetchEmployer = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/employers/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
          params: { t: Date.now() },
        });
        setEmployer(res.data.employer);
        setStatusCode(null);
      } catch (err) {
        setStatusCode(err.response?.status || 500);
      }
    };

    const checkPendingApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/employer/jobs/applications/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasPendingApplications(res.data.applications?.length > 0);
      } catch {}
    };

    fetchEmployer();
    checkPendingApplications();
  }, []);

  const handleProfileClick = () => fileInputRef.current?.click();

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");
      await axiosInstance.put("/api/employers/picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const refreshed = await axiosInstance.get("/api/employers/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() },
      });

      setEmployer(refreshed.data.employer);
      setUploadStatus("success");
    } catch {
      setUploadStatus("error");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const renderStatusPage = (title, message, buttonText, buttonAction, bgColor, textColor) => (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center px-4`}>
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h2 className={`text-2xl font-bold ${textColor} mb-4`}>{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button onClick={buttonAction} className="w-full py-3 bg-lime-600 text-white rounded-xl hover:bg-lime-500 transition-all duration-300">
          {buttonText}
        </button>
      </div>
    </div>
  );

  if (statusCode === 410) {
    return renderStatusPage(
      "Registration Declined",
      "Your employer registration was declined. Please review your documents and reapply.",
      "Re-register as Employer",
      async () => {
        try {
          const token = localStorage.getItem("token");
          await axiosInstance.delete("/api/employers/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {}
        navigate("/employer-registration");
      },
      "bg-red-100",
      "text-red-700"
    );
  }

  if (statusCode === 404) {
    return renderStatusPage(
      "Employer Profile Not Found",
      "You haven't registered yet. Submit your employer application to begin.",
      "Go to Registration",
      () => navigate("/employer-registration"),
      "bg-orange-100",
      "text-orange-700"
    );
  }

  if (statusCode === 403) {
    return renderStatusPage(
      "Awaiting Verification",
      "Your application is under review. Please wait for admin verification.",
      "Back to Account",
      () => navigate("/account"),
      "bg-yellow-100",
      "text-yellow-700"
    );
  }

  if (!employer && !statusCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 text-sky-900 text-lg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-lime-600 rounded-full mb-4"></div>
          <p>Loading employer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center p-4 md:p-8">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold text-sky-900 mb-6 text-center">Edit Profile</h3>
            <div className="mb-6">
              <label className="block text-gray-700 mb-3 text-lg font-medium">Change Profile Picture</label>
              <button onClick={handleProfileClick} className="w-full py-3 bg-lime-600 text-white rounded-xl hover:bg-lime-500 flex justify-center items-center gap-2">
                <FaEdit /> Change Picture
              </button>
              <input type="file" ref={fileInputRef} onChange={handlePictureUpload} className="hidden" accept="image/*" />
              {uploading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="w-6 h-6 border-t-2 border-lime-600 border-solid rounded-full animate-spin"></div>
                  <p className="ml-2 text-gray-600">Uploading picture...</p>
                </div>
              )}
              {uploadStatus === "success" && (
                <div className="flex items-center justify-center mt-4 text-lime-600 bg-lime-50 p-3 rounded-lg animate-pulse">
                  <FaCheck className="mr-2" /> Picture uploaded successfully!
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center justify-center mt-4 text-red-600 bg-red-50 p-3 rounded-lg">
                  <FaTimes className="mr-2" /> Upload failed. Please try again.
                </div>
              )}
            </div>
            <button onClick={() => setShowEditModal(false)} className="w-full py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300">Close</button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="bg-white max-w-6xl w-full p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-8">
        {/* Profile */}
        <div className="md:w-[60%] w-full text-center bg-gradient-to-b from-sky-50 to-emerald-50 p-6 rounded-2xl relative border border-sky-100 shadow-md">
          <button onClick={() => setShowEditModal(true)} className="absolute top-5 right-5 bg-lime-600 text-white p-3 rounded-full hover:bg-lime-500 hover:rotate-12">
            <FaEdit />
          </button>
          <div className="relative inline-block mb-6">
            {employer.profilePicture === "default-profile.png" ? (
              <FaUserCircle className="w-36 h-36 mx-auto text-gray-400 border-4 border-sky-200 rounded-full p-2 shadow-inner" />
            ) : (
              <img src={employer.profilePicture} alt="Profile" className="w-36 h-36 mx-auto rounded-full object-cover border-4 border-sky-200 shadow-inner" />
            )}
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-lime-500 rounded-full border-2 border-white"></div>
          </div>

          <h2 className="text-3xl font-bold text-sky-900">{employer.companyName}</h2>
          <p className="text-gray-600 font-medium mb-6">{employer.email}</p>

          <div className="text-left text-sm space-y-3 text-gray-700 bg-white p-5 rounded-xl shadow">
            <p><strong>Contact Person:</strong> {employer.firstName} {employer.middleName} {employer.lastName}</p>
            <p><strong>Sex:</strong> {employer.sex}</p>
            <p><strong>Age:</strong> {employer.age}</p>
            <p><strong>Birthdate:</strong> {new Date(employer.birthdate).toLocaleDateString()}</p>
            <p><strong>Nationality:</strong> {employer.nationality}</p>
            <p><strong>Status:</strong> <span className="text-lime-600 font-medium">{employer.status}</span></p>
          </div>

          <button onClick={() => navigate("/account")} className="w-full cursor-pointer mt-8 py-3 bg-gradient-to-r from-lime-600 to-lime-500 text-white rounded-xl hover:from-lime-500 hover:to-lime-400">
            Back to Account
          </button>
        </div>

        {/* Quick Access */}
        <div className="md:w-[40%] w-full bg-gradient-to-b from-emerald-50 to-sky-50 p-6 rounded-2xl border border-emerald-100 shadow-md">
          <h3 className="text-2xl font-semibold text-sky-900 mb-6 text-center border-b pb-3">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "My Address", path: "/employer-address", desc: "Manage your address info" },
              { label: "Job Postings", path: "/employer-jobs", desc: "Create or update jobs" },
              { label: "Pending Applications", path: "/employer/job-applications/pending", desc: "Review job applications", badge: hasPendingApplications },
              { label: "Ongoing Workers", path: "/employer/jobs/ongoing", desc: "View ongoing contracts" },
            ].map(({ label, path, badge, desc }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`${buttonBase}`}
              >
                <div className="text-sky-800 font-semibold text-md">{label}</div>
                <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-700">{desc}</div>
                {badge && (
                  <span className="absolute top-2 right-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 justify-center items-center text-xs text-white">
                      <FaBell />
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
