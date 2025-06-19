import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaEdit, FaUser } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

const Account = () => {
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
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
        });
      } catch (error) {
        setIsLoggedIn(false);
        console.error("Failed to fetch user data", error);
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

      setUser({ ...user, profilePicture: response.data.profilePicture });
    } catch (error) {
      console.error("Upload error:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
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
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 text-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-lime-700 mb-4">You're not logged in</h2>
          <p className="text-gray-700 mb-6">
            To access your account and update your profile, please sign in or create an account.
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              to="/login"
              className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full py-2 bg-white border border-lime-700 text-lime-700 rounded-lg hover:bg-lime-100 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if profile picture should be replaced with icon
  const showProfileIcon = !user?.profilePicture || 
                         user.profilePicture.includes("default-profile.png");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-center">
        {/* Profile Picture */}
        <div className="relative w-32 h-32 mx-auto mb-4 group">
          {!showProfileIcon ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-lime-700 group-hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser className="text-8xl text-lime-700 group-hover:opacity-80 transition-opacity" />
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleProfilePictureChange}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="absolute -bottom-6 w-full">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-lime-600 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">
                  {uploadProgress}% uploaded
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="space-y-3">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              required
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="w-full px-3 py-2 border border-lime-700 rounded-lg focus:outline-none focus:ring focus:ring-lime-700 text-lg"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full py-2 bg-gray-200 text-lime-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-lime-700">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-700">{user?.email}</p>
            <button
              onClick={handleEditToggle}
              className="w-full mt-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition flex items-center justify-center space-x-2"
            >
              <FaEdit />
              <span>Edit Account</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Account;