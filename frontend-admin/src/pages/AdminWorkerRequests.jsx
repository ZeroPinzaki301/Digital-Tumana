import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminWorkerRequests = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axiosInstance.get("/api/admin-approval/workers/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkers(res.data.workers);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch worker applications");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleStatusUpdate = async (workerId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosInstance.patch(
        `/api/admin-approval/workers/${workerId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkers((prev) => prev.filter((w) => w._id !== workerId));
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-100 p-6">
      <h2 className="text-2xl font-bold text-sky-900 mb-6 text-center">Pending Worker Applications</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : workers.length === 0 ? (
        <p className="text-center text-sky-900">No pending worker applications.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workers.map((worker) => (
            <div key={worker._id} className="bg-white rounded-lg shadow-md border border-sky-900 p-4">
              <h3 className="text-xl font-semibold text-sky-900 mb-2">
                {worker.firstName} {worker.lastName}
              </h3>
              <p className="text-sm text-gray-700">Email: {worker.email}</p>
              <p className="text-sm text-gray-700">Sex: {worker.sex}</p>
              <p className="text-sm text-gray-700">Age: {worker.age}</p>
              <p className="text-sm text-gray-700">Birthdate: {new Date(worker.birthdate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-700">Nationality: {worker.nationality}</p>

              <div className="mt-4 flex flex-col items-center gap-1">
                <a href={worker.validIdImage} target="_blank" rel="noreferrer" className="text-sm text-sky-700 underline">
                  View Valid ID
                </a>
                {worker.resumeFile && (
                  <a href={worker.resumeFile} target="_blank" rel="noreferrer" className="text-sm text-sky-700 underline">
                    View Resume
                  </a>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleStatusUpdate(worker._id, "verified")} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500">
                  <FaCheckCircle /> Verify
                </button>
                <button onClick={() => handleStatusUpdate(worker._id, "deleted")} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500">
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

export default AdminWorkerRequests;