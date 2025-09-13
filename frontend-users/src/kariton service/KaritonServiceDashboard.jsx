import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const KaritonServiceDashboard = () => {
  const [rider, setRider] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("karitonToken");
    localStorage.removeItem("karitonId");
    localStorage.removeItem("karitonFirstName");
    navigate("/kariton-service/login");
  };

  const toggleStatus = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("karitonToken");
      const id = localStorage.getItem("karitonId");

      const response = await axiosInstance.patch(
        `/api/kariton/update-status`,
        { isActive: !rider.isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRider(response.data.data);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchRider = async () => {
      try {
        const token = localStorage.getItem("karitonToken");
        const id = localStorage.getItem("karitonId");

        const response = await axiosInstance.get(`/api/kariton/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRider(response.data);
      } catch (error) {
        console.error("Failed to fetch rider:", error);
        navigate("/kariton-service/login");
      }
    };

    const fetchRatings = async () => {
      try {
        const token = localStorage.getItem("karitonToken");

        const response = await axiosInstance.get(`/api/rider/rating/my-ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRatings(response.data.data);
      } catch (error) {
        console.error("Failed to fetch ratings:", error);
      }
    };

    fetchRider();
    fetchRatings();
  }, [navigate]);

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
    : null;

  if (!rider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lime-50">
        <p className="text-lg font-semibold text-lime-700 animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lime-50 flex flex-col items-center p-4 sm:p-6 relative">
      {/* Top Buttons */}
      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="bg-lime-700 border border-lime-700 text-white px-4 sm:px-5 py-2 rounded-lg shadow-md hover:bg-lime-800 transition"
        >
          ← Back
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 sm:px-5 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white border border-lime-700 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center">
        {/* Profile */}
        <img
          src={rider.profilePicture || "/default-profile.png"}
          alt="Profile"
          className="w-28 sm:w-36 h-28 sm:h-36 rounded-full object-cover border-4 border-lime-700 shadow-md mb-4 sm:mb-6"
        />
        <h1 className="text-2xl sm:text-4xl font-bold text-lime-700 mb-1 sm:mb-2 text-center">
          {rider.firstName} {rider.lastName}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg italic mb-6 sm:mb-8 text-center">
          Trusted Kariton Rider
        </p>

        {/* Rating Summary */}
        <div className="w-full max-w-md mb-6 sm:mb-8 text-center">
          <h2 className="text-xl font-bold text-lime-700 mb-2">Your Rider Ratings</h2>
          {totalRatings > 0 ? (
            <>
              <p className="text-lg text-gray-800">
                ⭐ Average Rating: <span className="font-semibold text-lime-700">{averageRating}</span>
              </p>
              <p className="text-sm text-gray-600">
                Based on <span className="font-semibold">{totalRatings}</span> rating{totalRatings > 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <p className="text-gray-500 italic">No ratings yet.</p>
          )}
        </div>

        {/* Status Toggle */}
        <div className="w-full max-w-md mb-6 sm:mb-8">
          <button
            onClick={toggleStatus}
            disabled={isUpdating}
            className={`w-full py-3 rounded-lg text-lg font-semibold transition shadow-md ${
              rider.isActive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isUpdating ? "Updating..." : rider.isActive ? "Deactivate Account" : "Activate Account"}
          </button>
          <p className="text-center text-sm text-gray-500 mt-2">
            Current status:{" "}
            <span className={rider.isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {rider.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full mb-6 sm:mb-10">
          <div className="bg-white border border-lime-700 rounded-lg p-4 sm:p-5 shadow-sm text-center">
            <p className="text-sm text-gray-500">Login Code</p>
            <p className="text-lg font-semibold text-lime-700">{rider.loginCode}</p>
          </div>
          <div className="bg-white border border-lime-700 rounded-lg p-4 sm:p-5 shadow-sm text-center">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold text-gray-800">{rider.email}</p>
          </div>
          <div className="bg-white border border-lime-700 rounded-lg p-4 sm:p-5 shadow-sm sm:col-span-2 text-center">
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-lg font-semibold text-gray-800">
              {rider.houseNo}, {rider.street}, {rider.barangay}, {rider.municipality}, {rider.province}
            </p>
          </div>
          <div className="bg-white border border-lime-700 rounded-lg p-4 sm:p-5 shadow-sm sm:col-span-2 text-center">
            <p className="text-sm text-gray-500">Birthdate</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(rider.birthdate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center">
          <button
            onClick={() => navigate("/kariton-service/rider/delivery-requests")}
            className="flex-1 py-4 sm:py-5 bg-lime-700 text-white rounded-lg text-lg sm:text-xl font-semibold hover:bg-lime-800 transition shadow-md"
          >
            Delivery Requests
          </button>
          <button
            onClick={() => navigate("/kariton-service/rider/delivery-history")}
            className="flex-1 py-4 sm:py-5 bg-lime-700 text-white rounded-lg text-lg sm:text-xl font-semibold hover:bg-lime-800 transition shadow-md"
          >
            Delivery History
          </button>
        </div>
      </div>
    </div>
  );
};

export default KaritonServiceDashboard;