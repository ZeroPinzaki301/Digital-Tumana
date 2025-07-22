import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminCustomerRequests = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <h2 className="text-2xl font-bold text-sky-900 mb-6 text-center">Pending Customer Applications</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : customers.length === 0 ? (
        <p className="text-center text-sky-900">No pending customer applications.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map((customer) => (
            <div key={customer._id} className="bg-white rounded-lg shadow-md border border-orange-300 p-4">
              <h3 className="text-xl font-semibold text-orange-700 mb-2">{customer.fullName}</h3>
              <p className="text-sm text-gray-700">Email: {customer.email}</p>
              <p className="text-sm text-gray-700">Telephone: {customer.telephone}</p>
              <p className="text-sm text-gray-700">
                Address: {customer.street}, {customer.barangay}, {customer.cityOrMunicipality}, {customer.province}, {customer.region} - {customer.postalCode}
              </p>

              <div className="mt-4 flex flex-col items-center gap-1">
                <a
                  href={customer.idImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-orange-700 underline"
                >
                  View Uploaded ID ({customer.idType})
                </a>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => handleApproval(customer._id)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500"
                >
                  <FaCheckCircle /> Verify
                </button>
                <button
                  onClick={() => handleRejection(customer._id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500"
                >
                  <FaTimesCircle /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomerRequests;