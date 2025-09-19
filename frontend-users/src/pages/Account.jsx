import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaUser, FaStore, FaTools, FaBriefcase, FaGraduationCap, FaPhone, FaEnvelope, FaAward, FaIdCard } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

const Account = () => {
  const [user, setUser] = useState(null);
  const [badge, setBadge] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [badgeLoading, setBadgeLoading] = useState(true);
  
  // New state for default ID cards
  const [defaultIdCard, setDefaultIdCard] = useState(null);
  const [idCardLoading, setIdCardLoading] = useState(true);
  const [idCardError, setIdCardError] = useState(null);
  
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
        
        // Fetch badge data after user data is loaded
        await fetchBadgeData(token);
        // Fetch default ID card data
        await fetchDefaultIdCard(token);
      } catch (error) {
        setIsLoggedIn(false);
        console.error("Failed to fetch user data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchBadgeData = async (token) => {
      try {
        const response = await axiosInstance.get("/api/tesda/badge", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBadge(response.data.badge);
      } catch (error) {
        // If badge is not found, it's not an error - just set badge to null
        if (error.response?.status !== 404) {
          console.error("Failed to fetch badge data", error);
        }
      } finally {
        setBadgeLoading(false);
      }
    };

    const fetchDefaultIdCard = async (token) => {
      try {
        const response = await axiosInstance.get("/api/default-id", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDefaultIdCard(response.data.defaultIdCard);
      } catch (error) {
        // If no ID card is found, it's not an error - just set to null
        if (error.response?.status !== 404) {
          console.error("Failed to fetch default ID card", error);
          setIdCardError("Failed to load ID card information");
        }
      } finally {
        setIdCardLoading(false);
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

  // Handle ID card operations
  const handleAddIdCard = () => {
    navigate("/upload-id");
  };

  const handleEditIdCard = () => {
    navigate("/edit-id");
  };

  const handleDeleteIdCard = async () => {
    if (window.confirm('Are you sure you want to delete your default ID card?')) {
      try {
        await axiosInstance.delete("/api/default-id", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDefaultIdCard(null);
      } catch (error) {
        console.error("Failed to delete ID card:", error);
        setIdCardError("Failed to delete ID card");
      }
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

        {/* TESDA Badge Section - Only show if badge exists */}
        {badge && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-amber-300 shadow-sm">
            <div className="flex items-center mb-3">
              <FaAward className="text-2xl text-amber-600 mr-2" />
              <h3 className="text-xl font-bold text-amber-800">TESDA Certification</h3>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <h4 className="text-lg font-semibold text-amber-700 mb-2">CERTIFIED TUMANA GRADUATE</h4>
              <p className="text-gray-700">
                This person has completed the TESDA NC1 agricultural course enrolled through Digital Tumana to Angel Tolits Integrated Farm.
              </p>
              <div className="mt-3 flex items-center text-sm text-amber-600">
                <FaGraduationCap className="mr-1" />
                <span>National Certificate (NC) Level I</span>
              </div>
            </div>
          </div>
        )}

        {/* Default ID Card Section - NEW SECTION */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaIdCard className="text-2xl text-indigo-600 mr-2" />
              <h3 className="text-xl font-bold text-indigo-800">Default Identification Cards</h3>
            </div>
            {!defaultIdCard && (
              <button
                onClick={handleAddIdCard}
                className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5 duration-300 text-sm"
              >
                Add New ID
              </button>
            )}
          </div>

          {idCardLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-2">Loading ID information...</p>
            </div>
          ) : idCardError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{idCardError}</p>
            </div>
          ) : !defaultIdCard ? (
            <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-indigo-200">
              <FaIdCard className="text-4xl text-indigo-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">You have no uploaded ID yet</p>
              <button
                onClick={handleAddIdCard}
                className="py-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5 duration-300"
              >
                Upload Your ID
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-indigo-100 p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-indigo-700">
                  Primary ID: {defaultIdCard.idType}
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditIdCard}
                    className="py-1 px-3 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteIdCard}
                    className="py-1 px-3 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <img
                    src={defaultIdCard.idImage}
                    alt={`Primary ${defaultIdCard.idType}`}
                    className="w-full max-w-xs h-48 object-contain mx-auto border rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">Primary ID</p>
                </div>

                {defaultIdCard.secondIdImage && (
                  <div className="text-center">
                    <img
                      src={defaultIdCard.secondIdImage}
                      alt={`Secondary ${defaultIdCard.secondIdType}`}
                      className="w-full max-w-xs h-48 object-contain mx-auto border rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Secondary ID ({defaultIdCard.secondIdType})
                    </p>
                  </div>
                )}
              </div>

              {defaultIdCard.secondIdType && !defaultIdCard.secondIdImage && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-sm text-blue-700">
                    Secondary ID Type: {defaultIdCard.secondIdType}
                    <br />
                    <span className="text-blue-600">(No image uploaded for secondary ID)</span>
                  </p>
                </div>
              )}
            </div>
          )}
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
