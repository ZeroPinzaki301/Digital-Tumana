import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [hasOngoingOrders, setHasOngoingOrders] = useState(false);
  const [hasPendingAffiliations, setHasPendingAffiliations] = useState(false);
  const [hasPendingCustomerVerifications, setHasPendingCustomerVerifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndData = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        navigate("/admin-login");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Check ongoing orders
        const ordersRes = await axiosInstance.get("/api/order-tracking/admin/confirmed", { headers });
        setHasOngoingOrders(Array.isArray(ordersRes.data.orders) && ordersRes.data.orders.length > 0);

        // Check pending affiliations - handle different response formats
        const [sellersRes, workersRes, employersRes, customersRes] = await Promise.all([
          axiosInstance.get("/api/admin-approval/sellers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/workers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/employers/pending", { headers }),
          axiosInstance.get("/api/admin-approval/customers/pending", { headers }),
        ]);

        console.log("Sellers response:", sellersRes.data);
        console.log("Workers response:", workersRes.data);
        console.log("Employers response:", employersRes.data);
        console.log("Customers response:", customersRes.data);

        // Handle different response formats
        const checkForPendingData = (data) => {
          // If it's an array, check if it has items
          if (Array.isArray(data)) {
            return data.length > 0;
          }
          
          // If it's an object with a customers array
          if (typeof data === 'object' && data !== null) {
            // Check for customers array with items
            if (Array.isArray(data.customers) && data.customers.length > 0) {
              return true;
            }
            
            // Check for other array properties with items
            for (let key in data) {
              if (Array.isArray(data[key]) && data[key].length > 0) {
                return true;
              }
            }
          }
          
          return false;
        };

        const hasPendingSellers = checkForPendingData(sellersRes.data);
        const hasPendingWorkers = checkForPendingData(workersRes.data);
        const hasPendingEmployers = checkForPendingData(employersRes.data);
        const hasPendingCustomers = checkForPendingData(customersRes.data);

        const hasPending = hasPendingSellers || hasPendingWorkers || hasPendingEmployers;
        
        console.log("Has pending sellers:", hasPendingSellers);
        console.log("Has pending workers:", hasPendingWorkers);
        console.log("Has pending employers:", hasPendingEmployers);
        console.log("Has pending customers:", hasPendingCustomers);
        console.log("Has pending affiliations:", hasPending);
        
        setHasPendingAffiliations(hasPending);
        setHasPendingCustomerVerifications(hasPendingCustomers);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {/* Tumana Affiliation */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition relative"
        onClick={() => navigate("/admin-affiliation-requests")}
      >
        <span className="text-lg font-semibold text-sky-900">Tumana Affiliation Requests</span>
        {hasPendingAffiliations && (
          <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">!</span>
          </span>
        )}
      </div>

      {/* Customer Verification */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition relative"
        onClick={() => navigate("/admin-customer-verifications")}
      >
        <span className="text-lg font-semibold text-sky-900">Customer Verification Requests</span>
        {hasPendingCustomerVerifications && (
          <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">!</span>
          </span>
        )}
      </div>

      {/* Ongoing Orders */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition relative"
        onClick={() => navigate("/admin-ongoing-orders")}
      >
        <span className="text-lg font-semibold text-sky-900">Ongoing Orders</span>
        {hasOngoingOrders && (
          <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">!</span>
          </span>
        )}
      </div>

      {/* Kariton Service */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin-kariton-service")}
      >
        <span className="text-lg font-semibold text-sky-900">Kariton Service</span>
      </div>

      {/* Pending Payment */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin/pending-payment-orders")}
      >
        <span className="text-lg font-semibold text-sky-900">Pending Payment</span>
      </div>

      {/* Seller Bank */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin/seller-balances")}
      >
        <span className="text-lg font-semibold text-sky-900">Seller Bank</span>
      </div>

      {/* Tesda Enrollments */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin/tesda/enrollment/pending")}
      >
        <span className="text-lg font-semibold text-sky-900">Tesda Enrollments</span>
      </div>
    </div>
  );
};

export default AdminDashboard;