import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const AdminAffiliationRequests = () => {
  const navigate = useNavigate();
  const [pendingCounts, setPendingCounts] = useState({
    sellers: 0,
    workers: 0,
    employers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingCounts = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate("/admin-login");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [sellersRes, workersRes, employersRes] = await Promise.all([
          axiosInstance.get("/api/admin-approval/sellers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/workers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/employers/pending", { headers }),
        ]);

        // Function to count pending items regardless of response format
        const countPendingItems = (data) => {
          if (Array.isArray(data)) return data.length;
          
          if (typeof data === 'object' && data !== null) {
            // Check for array properties
            for (let key in data) {
              if (Array.isArray(data[key])) return data[key].length;
            }
            
            // If it's an object with keys but no array, count the keys
            return Object.keys(data).length;
          }
          
          return 0;
        };

        setPendingCounts({
          sellers: countPendingItems(sellersRes.data),
          workers: countPendingItems(workersRes.data),
          employers: countPendingItems(employersRes.data)
        });

      } catch (err) {
        console.error("Error fetching pending counts:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCounts();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-sky-900 space-y-4">
        <h2 className="text-3xl font-bold text-sky-900 text-center tracking-widest mb-7">Affiliation Requests</h2>

        <div className="relative">
          <button
            onClick={() => navigate("/admin-seller-requests")}
            className="w-full py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition cursor-pointer text-xl font-bold tracking-widest relative"
          >
            Seller Applications
            {pendingCounts.sellers > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs text-white font-bold">{pendingCounts.sellers}</span>
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => navigate("/admin-worker-requests")}
            className="w-full py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition cursor-pointer text-xl font-bold tracking-widest relative"
          >
            Worker Applications
            {pendingCounts.workers > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs text-white font-bold">{pendingCounts.workers}</span>
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => navigate("/admin-employer-requests")}
            className="w-full py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-600/75 transition cursor-pointer text-xl font-bold tracking-widest relative"
          >
            Employer Applications
            {pendingCounts.employers > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs text-white font-bold">{pendingCounts.employers}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAffiliationRequests;