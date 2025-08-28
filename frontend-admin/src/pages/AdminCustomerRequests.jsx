import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaIdCard, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";

const AdminCustomerRequests = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axiosInstance.get("/api/admin-approval/customers/pending", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data.customers);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch customer applications");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleApproval = async (customerId) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.patch(`/api/admin-approval/customers/${customerId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers((prev) => prev.filter((c) => c._id !== customerId));
    } catch (err) {
      console.error("Approval failed:", err.response?.data || err.message);
    }
  };

  const handleRejection = async (customerId) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.delete(`/api/admin-approval/customers/${customerId}/reject`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers((prev) => prev.filter((c) => c._id !== customerId));
    } catch (err) {
      console.error("Rejection failed:", err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <div className="text-lg text-sky-700">Loading customer applications...</div>
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
          <h2 className="text-3xl font-bold text-sky-900">Pending Customer Applications</h2>
        </div>

        {error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="h-8 w-8 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-sky-900 mb-2">No Pending Applications</h3>
            <p className="text-sky-700">All customer applications have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div key={customer._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-sky-700 font-semibold text-lg">
                        {customer.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                      </span>
                    </div>
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-sky-900 mb-2">
                    {customer.fullName}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <FaEnvelope className="h-4 w-4 text-sky-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600 truncate">{customer.email}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <FaPhone className="h-4 w-4 text-sky-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{customer.telephone}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="h-4 w-4 text-sky-600 mt-1 mr-2 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <div>{customer.street}, {customer.barangay}</div>
                        <div>{customer.cityOrMunicipality}, {customer.province}</div>
                        <div>{customer.region} - {customer.postalCode}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-sky-800 mb-2">Identification</h4>
                    <div className="space-y-2">
                      <a
                        href={customer.idImage}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-sm text-sky-700 hover:text-sky-900 transition-colors"
                      >
                        <FaIdCard className="mr-2" />
                        View {customer.idType} ID
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => handleApproval(customer._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleRejection(customer._id)}
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

export default AdminCustomerRequests;