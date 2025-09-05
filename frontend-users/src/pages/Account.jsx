import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaUser, FaStore, FaTools, FaBriefcase, FaGraduationCap, FaPhone, FaEnvelope } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

const Account = () => {
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/api/users/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setFormData({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          phoneNumber: response.data.phoneNumber || "",
        });
      } catch (error) {
        setIsLoggedIn(false);
        console.error("Failed to fetch user data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleProfilePictureChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("profilePicture", file);

      setIsUploading(true);
      setUploadProgress(0);

      const response = await axiosInstance.patch(
        "/api/users/update-profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      setUser((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.patch(
        "/api/users/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser((prev) => ({
        ...prev,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        phoneNumber: response.data.user.phoneNumber,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 px-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-lime-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lime-700 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-lime-700 mb-4">You're not logged in</h2>
          <p className="text-gray-700 mb-6">
            To access your account and update your profile, please sign in or create an account.
          </p>
          <div className="flex flex-col space-y-3">
            <Link 
              to="/login" 
              className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition transform hover:-translate-y-1 duration-300"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="w-full py-2 bg-white border border-lime-700 text-lime-700 rounded-lg hover:bg-lime-100 transition transform hover:-translate-y-1 duration-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const showProfileIcon =
    !user?.profilePicture || user.profilePicture.includes("default-profile.png");

  return (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg border border-lime-700 transform transition-all duration-500 hover:shadow-xl">
        {/* Profile Section - Split Layout */}
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          {/* Left Side - Profile Picture and Name */}
          <div className="flex flex-col items-center md:items-start md:w-1/2">
            <div className="relative w-32 h-32 group mb-4">
              {!showProfileIcon ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-lime-700 group-hover:opacity-80 transition-all duration-300 transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-8xl text-lime-700 group-hover:opacity-80 transition-all duration-300 transform group-hover:scale-110" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <span className="text-white text-sm font-medium">Change Photo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleProfilePictureChange}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="absolute -bottom-6 w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-lime-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{uploadProgress}% uploaded</span>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="w-full space-y-3 animate-fadeIn">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-lg transition-all duration-300"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-lg transition-all duration-300"
                  required
                />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-lg transition-all duration-300"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition transform hover:-translate-y-0.5 duration-300 shadow hover:shadow-md"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full py-2 bg-gray-200 text-lime-700 rounded-lg hover:bg-gray-300 transition transform hover:-translate-y-0.5 duration-300"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-lime-700 animate-fadeIn text-center md:text-left">
                  {user?.firstName} {user?.lastName}
                </h2>
                <button
                  onClick={handleEditToggle}
                  className="w-full mt-4 cursor-pointer py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition transform hover:-translate-y-0.5 duration-300 flex items-center justify-center space-x-2 shadow hover:shadow-md"
                >
                  <FaEdit />
                  <span>Edit Account</span>
                </button>
              </>
            )}
          </div>

          {/* Right Side - Contact Information */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-lime-700 mb-4 border-b border-lime-200 pb-2">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-lime-100 p-3 rounded-full mr-3">
                  <FaEnvelope className="text-lime-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lime-700 font-medium">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-lime-100 p-3 rounded-full mr-3">
                  <FaPhone className="text-lime-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lime-700 font-medium">{user?.phoneNumber || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-lime-100 p-3 rounded-full mr-3">
                  <FaUser className="text-lime-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="text-lime-700 font-medium">
                    {user?.isVerified ? "Verified" : "Not Verified"} • 
                    {user?.isSeller ? " Seller" : ""}
                    {user?.isWorker ? " Worker" : ""}
                    {user?.isEmployer ? " Employer" : ""}
                    {!user?.isSeller && !user?.isWorker && !user?.isEmployer ? " Basic User" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div 
            className="bg-lime-600 text-white p-4 rounded-lg border border-sky-900 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
            onClick={() => navigate("/seller-dashboard")}
          >
            <div className="flex items-center">
              <FaStore className="text-2xl mr-3 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-lg font-semibold">Seller Dashboard</h3>
            </div>
            <p className="mt-2 text-lime-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Manage your products and sales
            </p>
          </div>

          <div 
            className="bg-lime-600 text-white p-4 rounded-lg border border-sky-900 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
            onClick={() => navigate("/worker-dashboard")}
          >
            <div className="flex items-center">
              <FaTools className="text-2xl mr-3 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-lg font-semibold">Worker Dashboard</h3>
            </div>
            <p className="mt-2 text-lime-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Find and manage work opportunities
            </p>
          </div>

          <div 
            className="bg-lime-600 text-white p-4 rounded-lg border border-sky-900 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
            onClick={() => navigate("/employer-dashboard")}
          >
            <div className="flex items-center">
              <FaBriefcase className="text-2xl mr-3 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-lg font-semibold">Employer Dashboard</h3>
            </div>
            <p className="mt-2 text-lime-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Post jobs and manage applicants
            </p>
          </div>

          <div 
            className="bg-lime-600 text-white p-4 rounded-lg border border-sky-900 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
            onClick={() => navigate("/learn/tesda/enroll")}
          >
            <div className="flex items-center">
              <FaGraduationCap className="text-2xl mr-3 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-lg font-semibold">Learner Page</h3>
            </div>
            <p className="mt-2 text-lime-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Enroll in courses and track progress
            </p>
          </div>
        </div>
        
        <button
          onClick={() => navigate("/feedback")}
          className="w-full mt-4 cursor-pointer py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition transform hover:-translate-y-0.5 duration-300 flex items-center justify-center space-x-2 shadow hover:shadow-md"
        >
          <span>Send a Feedback</span>
        </button>
      </div>
    </div>
  );
};

export default Account;
