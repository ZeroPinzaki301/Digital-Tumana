import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const KaritonServiceDashboard = () => {
  const [rider, setRider] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("karitonToken");
    localStorage.removeItem("karitonId");
    localStorage.removeItem("karitonFirstName");
    navigate("/kariton-service/login");
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

    fetchRider();
  }, [navigate]);

  if (!rider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-lg font-semibold text-lime-700 animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4 sm:p-6 relative">
      {/* Back Button - Top Left */}
      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-white cursor-pointer border border-lime-700 text-lime-700 px-4 sm:px-5 py-2 rounded-lg shadow-md hover:bg-lime-100 transition"
        >
          ← Back
        </button>

        {/* Logout Button - Top Right */}
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
              {rider.houseNo}, {rider.street}, {rider.barangay}, {rider.municipality},{" "}
              {rider.province}
            </p>
          </div>
          <div className="bg-white border border-lime-700 rounded-lg p-4 sm:p-5 shadow-sm sm:col-span-2 text-center">
            <p className="text-sm text-gray-500">Birthdate</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(rider.birthdate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons at Bottom Center */}
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