import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SellerDashboard = () => {
  const [seller, setSeller] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/sellers/dashboard", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          params: {
            t: Date.now() // Adds a timestamp to make each request unique
          }
        });
        setSeller(res.data.seller);
        setStatusCode(null); // Reset status code on success
      } catch (err) {
        const code = err.response?.status;
        setStatusCode(code || 500);
      }
    };

    fetchSeller();
  }, []);

  // 🟥 404 — Not registered
  if (statusCode === 404) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-orange-400">
          <h2 className="text-xl font-bold text-orange-700 mb-2">Seller Profile Not Found</h2>
          <p className="text-gray-700">
            You haven’t registered as a seller yet. To begin, please submit a seller application.
          </p>
          <button
            onClick={() => navigate("/seller-registration")}
            className="mt-4 w-full py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }
  
  // 🟧 410 — Seller declined
  if (statusCode === 410) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-red-400">
          <h2 className="text-xl font-bold text-red-700 mb-2">Registration Declined</h2>
          <p className="text-gray-700">
            Your seller registration has been declined by the admin team. Please review your credentials
            and requirements, and feel free to reapply with updated information.
          </p>
          <button
            onClick={() => navigate("/seller-registration")}
            className="mt-4 w-full py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
          >
            Re-register as Seller
          </button>
        </div>
      </div>
    );
  }

  // 🟨 403 — Not Verified Yet
  if (statusCode === 403) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-yellow-400">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Awaiting Verification</h2>
          <p className="text-gray-700">
            Your seller application is still under review. Please wait for verification from the admin team.
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

  // 🟩 While loading
  if (!seller && !statusCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-100 text-sky-900 text-lg">
        Loading seller dashboard...
      </div>
    );
  }

  // 🟦 Verified seller dashboard
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center border border-sky-900">
        <img
          src={seller.storePicture}
          alt="Store"
          className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-sky-900 mb-4"
        />
        <h2 className="text-2xl font-bold text-sky-900 mb-2">{seller.storeName}</h2>
        <p className="text-sm text-gray-600 mb-6">{seller.email}</p>

        <div className="text-left text-sm space-y-2 text-gray-700">
          <p><strong>Owner:</strong> {seller.firstName} {seller.middleName} {seller.lastName}</p>
          <p><strong>Sex:</strong> {seller.sex}</p>
          <p><strong>Age:</strong> {seller.age}</p>
          <p><strong>Birthdate:</strong> {new Date(seller.birthdate).toLocaleDateString()}</p>
          <p><strong>Nationality:</strong> {seller.nationality}</p>
          <p><strong>Status:</strong> {seller.status}</p>
        </div>

        <button
          onClick={() => navigate("/affiliate-dashboards")}
          className="mt-6 w-full py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition"
        >
          Back to Affiliate Dashboards
        </button>
      </div>
    </div>
  );
};

export default SellerDashboard;