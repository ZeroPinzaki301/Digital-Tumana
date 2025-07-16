import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaUserCircle } from "react-icons/fa";

const EmployerDashboard = () => {
  const [employer, setEmployer] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };
    fetchEmployer();
  }, []);

  const handleProfileClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
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
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (statusCode === 410) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-red-400">
          <h2 className="text-xl font-bold text-red-700 mb-2">Registration Declined</h2>
          <p className="text-gray-700">
            Your employer registration was declined. Please review your documents and reapply.
          </p>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await axiosInstance.delete("/api/employers/me", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                navigate("/employer-registration");
              } catch {
                navigate("/employer-registration");
              }
            }}
            className="mt-4 w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
          >
            Re-register as Employer
          </button>
        </div>
      </div>
    );
  }

  if (statusCode === 404) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-orange-400">
          <h2 className="text-xl font-bold text-orange-700 mb-2">Employer Profile Not Found</h2>
          <p className="text-gray-700">
            You haven’t registered yet. Submit your employer application to begin.
          </p>
          <button
            onClick={() => navigate("/employer-registration")}
            className="mt-4 w-full py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  if (statusCode === 403) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-yellow-400">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Awaiting Verification</h2>
          <p className="text-gray-700">
            Your application is under review. Please wait for admin verification.
          </p>
          <button
            onClick={() => navigate("/account")}
            className="mt-4 w-full py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 transition"
          >
            Back to Account
          </button>
        </div>
      </div>
    );
  }

  if (!employer && !statusCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 text-sky-900 text-lg">
        Loading employer dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white max-w-5xl w-full p-6 rounded-lg shadow-md border border-sky-900 flex flex-col md:flex-row gap-6">

        {/* Left — Profile Info */}
        <div className="md:w-1/2 w-full text-center">
          <div onClick={handleProfileClick} className="cursor-pointer">
            {employer.profilePicture === "default-profile.png" ? (
              <FaUserCircle className="w-32 h-32 mx-auto text-gray-500 mb-4 border-2 border-sky-900 rounded-full" />
            ) : (
              <img
                src={employer.profilePicture}
                alt="Profile"
                className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-sky-900 mb-4"
              />
            )}
            {uploading && (
              <p className="text-sm text-gray-500 mt-1">Uploading...</p>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePictureUpload}
            className="hidden"
          />

          <h2 className="text-2xl font-bold text-sky-900 mb-2">{employer.companyName}</h2>
          <p className="text-sm text-gray-600 mb-6">{employer.email}</p>

          <div className="text-left text-sm space-y-2 text-gray-700">
            <p><strong>Contact Person:</strong> {employer.firstName} {employer.middleName} {employer.lastName}</p>
            <p><strong>Sex:</strong> {employer.sex}</p>
            <p><strong>Age:</strong> {employer.age}</p>
            <p><strong>Birthdate:</strong> {new Date(employer.birthdate).toLocaleDateString()}</p>
            <p><strong>Nationality:</strong> {employer.nationality}</p>
            <p><strong>Status:</strong> {employer.status}</p>
          </div>

          <button
            onClick={() => navigate("/affiliate-dashboards")}
            className="mt-6 w-full py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition"
          >
            Back to Affiliate Dashboards
          </button>
        </div>

        {/* Right — Actions */}
        <div className="md:w-1/2 w-full flex flex-col justify-center gap-4 text-center">
          <h3 className="text-xl font-semibold text-sky-900 mb-2">Quick Access</h3>

          <button
            onClick={() => navigate("/employer-address")}
            className="py-2 px-4 bg-yellow-100 text-yellow-900 border border-yellow-600 rounded-lg hover:bg-yellow-200 transition"
          >
            My Address
          </button>

          <button
            onClick={() => navigate("/job-postings")}
            className="py-2 px-4 bg-indigo-100 text-indigo-900 border border-indigo-600 rounded-lg hover:bg-indigo-200 transition"
          >
            Job Postings
          </button>

          <button
            onClick={() => navigate("/employer-contacts")}
            className="py-2 px-4 bg-pink-100 text-pink-900 border border-pink-600 rounded-lg hover:bg-pink-200 transition"
          >
            Contacts
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;