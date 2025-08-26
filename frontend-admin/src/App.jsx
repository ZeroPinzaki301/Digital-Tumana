import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminVerify from "./pages/AdminVerify";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";
import AdminLayout from "./AdminLayout";
import AdminAffiliationRequests from "./pages/AdminAffiliationRequests";
import AdminSellerRequests from "./pages/AdminSellerRequests";
import AdminEmployerRequests from "./pages/AdminEmployerRequests";
import AdminWorkerRequests from "./pages/AdminWorkerRequests";
import AdminCustomerRequests from "./pages/AdminCustomerRequests";
import AdminConfirmedOrders from "./pages/AdminConfirmedOrder";
import AdminConfirmedOrderDetail from "./pages/AdminConfirmedOrderDetail";
import AdminShippedOrders from "./pages/AdminShippedOrder";
import AdminKaritonService from "./pages/AdminKaritonService";
import AdminCreateKaritonRider from "./pages/AdminCreateKaritonRider";
import AdminShippedOrderDetail from "./pages/AdminShippedOrderDetail";
import AdminKaritonRiderDetails from "./pages/AdminKaritonRiderDetails";
import AdminAssignRider from "./pages/AdminAssignRider";
import AdminOngoingDeliveries from "./pages/AdminOngoingDeliveries";
import AdminOrderTrackingPage from "./pages/AdminOngoingDeliveryDetail";
import AdminDeliveredOrders from "./pages/AdminDeliveredOrders";
import AdminDeliveredOrderDetails from "./pages/AdminDeliveredOrderDetails";
import AdminPendingPaymentOrders from "./pages/AdminPendingPaymentOrders";
import AdminPendingPaymentOrderDetails from "./pages/AdminPendingPaymentOrderDetails";
import AdminSellerBalances from "./pages/AdminSellerBalances";
import AdminPendingWithdrawal from "./pages/AdminPendingWithdrawal";
import AdminTesdaEnrollments from "./pages/AdminTesdaEnrollments";
import AdminTesdaEnrollmentDetail from "./pages/AdminTesdaEnrollmentDetail";

import "./App.css";

const AppRoutes = () => {
  const { pathname } = useLocation();
  const hideSidebarRoutes = ["/admin-login", "/admin-register", "/admin-verify"];
  const showSidebar = !hideSidebarRoutes.includes(pathname);

  return showSidebar ? (
    <AdminLayout>
      <Routes>

        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin-affiliation-requests" element={<AdminAffiliationRequests />} />
        <Route path="/admin-seller-requests" element={<AdminSellerRequests />} />
        <Route path="/admin-worker-requests" element={<AdminWorkerRequests />} />
        <Route path="/admin-employer-requests" element={<AdminEmployerRequests />} />
        <Route path="/admin-customer-verifications" element={<AdminCustomerRequests />} />
        <Route path="/admin-ongoing-orders" element={<AdminConfirmedOrders />} />
        <Route path="/admin/orders/:orderId" element={<AdminConfirmedOrderDetail />} />
        <Route path="/admin-shipped-orders" element={<AdminShippedOrders />} />
        <Route path="/admin/shipped-orders/:orderId" element={<AdminShippedOrderDetail />} />
        <Route path="/admin-kariton-service" element={<AdminKaritonService />} />
        <Route path="/admin/create-kariton-rider" element={<AdminCreateKaritonRider />} />
        <Route path="/admin/kariton-rider/:id" element={<AdminKaritonRiderDetails />} />
        <Route path="/admin/orders/:orderId/assign-rider" element={<AdminAssignRider />} />
        <Route path="/admin/orders/ongoing-delivery" element={<AdminOngoingDeliveries />} />
        <Route path="/admin/orders/delivered" element={<AdminDeliveredOrders />} />
        <Route path="/admin/deliveries/:orderId" element={<AdminOrderTrackingPage />} />
        <Route path="/admin/pending-payment-orders" element={<AdminPendingPaymentOrders />} />
        <Route path="/admin/pending-payment/:orderId" element={<AdminPendingPaymentOrderDetails />} />
        <Route path="/admin/delivered/:deliveryId" element={<AdminDeliveredOrderDetails />} />
        <Route path="/admin/seller-balances" element={<AdminSellerBalances />} />
        <Route path="/admin/seller-withdrawal/:sellerId" element={<AdminPendingWithdrawal />} />
        <Route path="/admin/tesda/enrollment/:status" element={<AdminTesdaEnrollments />} />
        <Route path="/admin/tesda/enrollment/detail/:enrollmentId" element={<AdminTesdaEnrollmentDetail />} />
      
      </Routes>
    </AdminLayout>
  ) : (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4">
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-verify" element={<AdminVerify />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;