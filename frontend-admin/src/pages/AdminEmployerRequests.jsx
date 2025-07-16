import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminEmployerRequests = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axiosInstance.get("/api/admin-approval/employers/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployers(res.data.employers);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch employer applications");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployers();
  }, []);

  const handleStatusUpdate = async (employerId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.patch(
        `/api/admin-approval/employers/${employerId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployers((prev) => prev.filter((e) => e._id !== employerId));
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-100 p-6">
      <h2 className="text-2xl font-bold text-sky-900 mb-6 text-center">Pending Employer Applications</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : employers.length === 0 ? (
        <p className="text-center text-sky-900">No pending employer applications.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employers.map((employer) => (
            <div key={employer._id} className="bg-white rounded-lg shadow-md border border-sky-900 p-4">
              <h3 className="text-xl font-semibold text-sky-900 mb-2">
                {employer.firstName} {employer.lastName}
              </h3>
              <p className="text-sm text-gray-700">Company: {employer.companyName}</p>
              <p className="text-sm text-gray-700">Email: {employer.email}</p>
              <p className="text-sm text-gray-700">Sex: {employer.sex}</p>
              <p className="text-sm text-gray-700">Age: {employer.age}</p>
              <p className="text-sm text-gray-700">Birthdate: {new Date(employer.birthdate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-700">Nationality: {employer.nationality}</p>

              <div className="mt-4 flex flex-col items-center gap-1">
                <a href={employer.validIdImage} target="_blank" rel="noreferrer" className="text-sm text-sky-700 underline">
                  View Valid ID
                </a>
                {employer.dtiCertificateImage && (
                  <a href={employer.dtiCertificateImage} target="_blank" rel="noreferrer" className="text-sm text-sky-700 underline">
                    View DTI Certificate
                  </a>
                )}
                {employer.birCertificateImage && (
                  <a href={employer.birCertificateImage} target="_blank" rel="noreferrer" className="text-sm text-sky-700 underline">
                    View BIR Certificate
                  </a>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleStatusUpdate(employer._id, "verified")} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500">
                  <FaCheckCircle /> Verify
                </button>
                <button onClick={() => handleStatusUpdate(employer._id, "deleted")} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500">
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

export default AdminEmployerRequests;