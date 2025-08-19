import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [hasOngoingOrders, setHasOngoingOrders] = useState(false);

  useEffect(() => {
    const checkOngoingOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get("/api/order-tracking/admin/confirmed", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHasOngoingOrders(response.data.orders.length > 0);
      } catch (err) {
        console.error("Failed to check ongoing orders:", err.message);
      }
    };
    checkOngoingOrders();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {/* See Users */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin-users")}
      >
        <span className="text-lg font-semibold text-sky-900">See Users</span>
      </div>

      {/* Tumana Affiliation */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin-affiliation-requests")}
      >
        <span className="text-lg font-semibold text-sky-900">Tumana Affiliation Requests</span>
      </div>

      {/* Customer Verification */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin-customer-verifications")}
      >
        <span className="text-lg font-semibold text-sky-900">Customer Verification Requests</span>
      </div>

      {/* Ongoing Orders */}
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition relative"
        onClick={() => navigate("/admin-ongoing-orders")}
      >
        <span className="text-lg font-semibold text-sky-900">Ongoing Orders</span>
        {hasOngoingOrders && (
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
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