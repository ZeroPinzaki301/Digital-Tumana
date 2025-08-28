import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaIdCard, FaFileAlt, FaReceipt } from "react-icons/fa";

const AdminSellerRequests = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axiosInstance.get("/api/admin-approval/sellers/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSellers(res.data.sellers);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch seller applications");
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  const handleStatusUpdate = async (sellerId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.patch(
        `/api/admin-approval/sellers/${sellerId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSellers((prev) => prev.filter((s) => s._id !== sellerId));
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <div className="text-lg text-sky-700">Loading seller applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate("/admin-affiliation-requests")}
            className="flex cursor-pointer items-center text-sky-700 hover:text-sky-900 font-medium transition-colors mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Requests
          </button>
          <h2 className="text-3xl font-bold text-sky-900">Pending Seller Applications</h2>
        </div>

        {error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="h-8 w-8 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-sky-900 mb-2">No Pending Applications</h3>
            <p className="text-sky-700">All seller applications have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <div key={seller._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-sky-700 font-semibold text-lg">
                        {seller.firstName?.charAt(0)}{seller.lastName?.charAt(0)}
                      </span>
                    </div>
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-sky-900 mb-2">
                    {seller.firstName} {seller.lastName}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="font-medium w-24">Email:</span>
                      <span className="truncate">{seller.email}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium w-24">Sex:</span> {seller.sex}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium w-24">Age:</span> {seller.age}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium w-24">Birthdate:</span> {new Date(seller.birthdate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium w-24">Nationality:</span> {seller.nationality}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-sky-800 mb-2">Documents</h4>
                    <div className="space-y-2">
                      <a
                        href={seller.validIdImage}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-sm text-sky-700 hover:text-sky-900 transition-colors"
                      >
                        <FaIdCard className="mr-2" />
                        View Valid ID
                      </a>
                      <a
                        href={seller.dtiCertificateImage}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-sm text-sky-700 hover:text-sky-900 transition-colors"
                      >
                        <FaFileAlt className="mr-2" />
                        View DTI Certificate
                      </a>
                      <a
                        href={seller.birCertificateImage}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-sm text-sky-700 hover:text-sky-900 transition-colors"
                      >
                        <FaReceipt className="mr-2" />
                        View BIR Certificate
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => handleStatusUpdate(seller._id, "verified")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(seller._id, "deleted")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      <FaTimesCircle /> Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellerRequests;