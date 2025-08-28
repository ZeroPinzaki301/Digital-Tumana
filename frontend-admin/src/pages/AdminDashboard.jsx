import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [hasMarketFlowActivity, setHasMarketFlowActivity] = useState(false);
  const [hasPendingAffiliations, setHasPendingAffiliations] = useState(false);
  const [hasPendingCustomerVerifications, setHasPendingCustomerVerifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndData = async () => {
      const token = localStorage.getItem('adminToken');

      // Redirect immediately if no token
      if (!token) {
        navigate("/admin-login");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [confirmedRes, shippedRes, ongoingRes, deliveredRes] = await Promise.all([
          axiosInstance.get("/api/order-tracking/admin/confirmed", { headers }),
          axiosInstance.get("/api/order-tracking/admin/shipped", { headers }),
          axiosInstance.get("/api/order-to-deliver/undelivered", { headers }).catch(() => ({ data: { data: [] } })),
          axiosInstance.get("/api/order-to-deliver/delivered", { headers }),
        ]);

        const hasConfirmed = Array.isArray(confirmedRes.data.orders) && confirmedRes.data.orders.length > 0;
        const hasShipped = Array.isArray(shippedRes.data.orders) && shippedRes.data.orders.length > 0;
        const hasOngoing = Array.isArray(ongoingRes.data.data) && ongoingRes.data.data.length > 0;
        const hasDelivered = Array.isArray(deliveredRes.data) && deliveredRes.data.length > 0;

        setHasMarketFlowActivity(hasConfirmed || hasShipped || hasOngoing || hasDelivered);

        // Check pending affiliations
        const [sellersRes, workersRes, employersRes, customersRes] = await Promise.all([
          axiosInstance.get("/api/admin-approval/sellers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/workers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/employers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/customers/pending", { headers }),
        ]);

        const checkForPendingData = (data) => {
          if (Array.isArray(data)) return data.length > 0;
          if (typeof data === 'object' && data !== null) {
            if (Array.isArray(data.customers) && data.customers.length > 0) return true;
            for (let key in data) {
              if (Array.isArray(data[key]) && data[key].length > 0) return true;
            }
          }
          return false;
        };

        const hasPendingSellers = checkForPendingData(sellersRes.data);
        const hasPendingWorkers = checkForPendingData(workersRes.data);
        const hasPendingEmployers = checkForPendingData(employersRes.data);
        const hasPendingCustomers = checkForPendingData(customersRes.data);

        setHasPendingAffiliations(hasPendingSellers || hasPendingWorkers || hasPendingEmployers);
        setHasPendingCustomerVerifications(hasPendingCustomers);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err.message);
        // If there's an authentication error, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('adminToken');
          navigate("/admin-login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndData();
  }, [navigate]);

  // If not authenticated, don't render anything (will redirect)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <div className="text-lg text-sky-700">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-900 mb-2">Admin Dashboard</h1>
        <p className="text-sky-700 mb-8">Manage all platform activities from one centralized location</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tumana Affiliation Card */}
          <div 
            onClick={() => navigate("/admin-affiliation-requests")}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 group relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                {hasPendingAffiliations && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Action needed
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Tumana Admission Portal</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">Manage seller, worker, and employer affiliation requests</p>
              <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-medium">
                Manage requests
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tumana Market Flow Card */}
          <div 
            onClick={() => navigate("/admin-ongoing-orders")}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 group relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                {hasMarketFlowActivity && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Active orders
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Tumana Market Flow</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">Monitor and manage ongoing orders and deliveries</p>
              <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-medium">
                View orders
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Kariton Service Card */}
          <div 
            onClick={() => navigate("/admin-kariton-service")}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Kariton Service</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">Manage mobile cart services and schedules</p>
              <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-medium">
                Manage services
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Seller Bank Card */}
          <div 
            onClick={() => navigate("/admin/seller-balances")}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Seller Bank</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">Manage seller balances and financial transactions</p>
              <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-medium">
                View balances
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tesda Enrollments Card */}
          <div 
            onClick={() => navigate("/admin/tesda/enrollment/pending")}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">TESDA Learners</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">Review and process TESDA training enrollment requests</p>
              <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-medium">
                Manage enrollments
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* User Management Card */}
          <div 
            onClick={() => navigate("/admin-user-management")}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">User Management</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">View all verified users, and their affiliated roles</p>
              <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-medium">
                Manage users
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* User Feedbacks */}
          <div 
            onClick={() => navigate("/admin-user-feedbacks")}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-100 group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">User Feedbacks</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">See all feedbacks and messages of users</p>
              <div className="flex items-center text-sky-600 group-hover:text-sky-700 font-medium">
                View user feedbacks
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

export default AdminDashboard;