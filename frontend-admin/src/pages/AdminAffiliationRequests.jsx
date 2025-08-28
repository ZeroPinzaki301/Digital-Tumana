import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const AdminAffiliationRequests = () => {
  const navigate = useNavigate();
  const [pendingCounts, setPendingCounts] = useState({
    sellers: 0,
    workers: 0,
    employers: 0,
    customers: 0
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

        const [sellersRes, workersRes, employersRes, customersRes] = await Promise.all([
          axiosInstance.get("/api/admin-approval/sellers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/workers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/employers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/customers/pending", { headers }),
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
          employers: countPendingItems(employersRes.data),
          customers: countPendingItems(customersRes.data)
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <div className="text-lg text-sky-700">Loading requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-sky-900 text-center mb-2 tracking-wide">
          Affiliation Requests
        </h2>
        <p className="text-center text-sky-700 mb-10">
          Manage pending applications from different user types
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Seller Card */}
          <div 
            onClick={() => navigate("/admin-seller-requests")}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border border-sky-100 group"
          >
            <div className="bg-gradient-to-r from-sky-400 to-sky-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                {pendingCounts.sellers > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {pendingCounts.sellers} pending
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Seller Applications</h3>
              <p className="text-sky-600 text-sm">Review and approve new seller account requests</p>
            </div>
            <div className="px-6 pb-4">
              <div className="inline-flex items-center text-sky-600 group-hover:text-sky-700 font-medium transition-colors">
                View applications
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Worker Card */}
          <div 
            onClick={() => navigate("/admin-worker-requests")}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border border-sky-100 group"
          >
            <div className="bg-gradient-to-r from-sky-400 to-sky-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                {pendingCounts.workers > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {pendingCounts.workers} pending
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Worker Applications</h3>
              <p className="text-sky-600 text-sm">Review and approve new worker account requests</p>
            </div>
            <div className="px-6 pb-4">
              <div className="inline-flex items-center text-sky-600 group-hover:text-sky-700 font-medium transition-colors">
                View applications
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Employer Card */}
          <div 
            onClick={() => navigate("/admin-employer-requests")}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border border-sky-100 group"
          >
            <div className="bg-gradient-to-r from-sky-400 to-sky-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {pendingCounts.employers > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {pendingCounts.employers} pending
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Employer Applications</h3>
              <p className="text-sky-600 text-sm">Review and approve new employer account requests</p>
            </div>
            <div className="px-6 pb-4">
              <div className="inline-flex items-center text-sky-600 group-hover:text-sky-700 font-medium transition-colors">
                View applications
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div 
            onClick={() => navigate("/admin-customer-verifications")}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border border-sky-100 group"
          >
            <div className="bg-gradient-to-r from-sky-400 to-sky-600 h-2"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {pendingCounts.customers > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {pendingCounts.customers} pending
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Customer Applications</h3>
              <p className="text-sky-600 text-sm">Review and approve new customer account requests</p>
            </div>
            <div className="px-6 pb-4">
              <div className="inline-flex items-center text-sky-600 group-hover:text-sky-700 font-medium transition-colors">
                View applications
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAffiliationRequests;