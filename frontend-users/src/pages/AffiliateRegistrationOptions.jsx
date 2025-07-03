import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const AffiliateRegistrationOptions = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleSellerClick = async () => {
    setChecking(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/api/sellers/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.seller?.status === "pending") {
        setShowPendingModal(true);
      } else {
        navigate("/seller-registration");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        navigate("/seller-registration"); // No record = proceed
      } else {
        console.error("Error checking seller status:", err);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm text-center border border-lime-700">
        <h2 className="text-2xl font-bold text-lime-700 mb-4">Become an Affiliate</h2>

        <div className="space-y-3">
          <button
            onClick={handleSellerClick}
            disabled={checking}
            className={`w-full py-2 ${
              checking ? "bg-gray-300 text-gray-600" : "bg-emerald-100 text-sky-900 hover:bg-emerald-200"
            } border border-sky-900 rounded-lg transition`}
          >
            {checking ? "Checking..." : "Register as Seller"}
          </button>

          <button
            disabled
            className="w-full py-2 bg-gray-200 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed"
          >
            Register as Worker
          </button>

          <button
            disabled
            className="w-full py-2 bg-gray-200 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed"
          >
            Register as Employer
          </button>
        </div>
      </div>

      {/* Pending Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm text-center border border-sky-900">
            <h3 className="text-xl font-bold text-sky-900 mb-2">
              Seller Registration Pending
            </h3>
            <p className="text-gray-700 mb-4">
              You already have a pending seller application. Please wait while we verify your submission.
            </p>
            <button
              onClick={() => navigate("/account")}
              className="w-full py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition"
            >
              Back to Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateRegistrationOptions;