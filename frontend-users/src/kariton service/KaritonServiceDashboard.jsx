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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-lime-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-100 flex flex-col md:flex-row">
      {/* Left Section: Rider Info */}
      <div className="md:w-2/3 p-8 bg-white shadow-lg">
        <div className="flex items-center gap-6">
          <img
            src={rider.profilePicture || "/default-profile.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-lime-700"
          />
          <div>
            <h1 className="text-3xl font-bold text-lime-700 mb-2">
              {rider.firstName} {rider.lastName}
            </h1>
            <p className="text-gray-700 text-lg">
              <strong>Login Code:</strong> {rider.loginCode}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>Email:</strong> {rider.email}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>Location:</strong> {rider.houseNo}, {rider.street},{" "}
              {rider.barangay}, {rider.municipality}, {rider.province}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>Birthdate:</strong>{" "}
              {new Date(rider.birthdate).toLocaleDateString()}
            </p>
            <p className="text-gray-700 text-lg">
              <strong>Telephone:</strong> {rider.telephone || "N/A"}
            </p>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Right Section: Navigation */}
      <div className="md:w-1/3 p-8 flex flex-col justify-center gap-6">
        <button
          onClick={() => navigate("/kariton-service/rider/delivery-requests")}
          className="w-full py-4 bg-lime-700 text-white rounded-lg text-xl font-semibold hover:bg-lime-800 transition"
        >
          Delivery Requests
        </button>

        <button
          onClick={() => navigate("/kariton-service/rider/delivery-history")}
          className="w-full py-4 bg-lime-700 text-white rounded-lg text-xl font-semibold hover:bg-lime-800 transition"
        >
          Delivery History
        </button>
      </div>
    </div>
  );
};

export default KaritonServiceDashboard;