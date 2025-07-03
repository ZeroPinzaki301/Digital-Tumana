import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminVerify from "./pages/AdminVerify";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";
import AdminLayout from "./AdminLayout";
import AdminAffiliationRequests from "./pages/AdminAffiliationRequests";
import AdminSellerRequests from "./pages/AdminSellerRequests";

import "./App.css";

const AppRoutes = () => {
  const { pathname } = useLocation();
  const hideSidebarRoutes = ["/admin-login", "/admin-register", "/admin-verify"];
  const showSidebar = !hideSidebarRoutes.includes(pathname);

  return showSidebar ? (
    <AdminLayout>
      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-affiliation-requests" element={<AdminAffiliationRequests />} />
        <Route path="/admin-seller-requests" element={<AdminSellerRequests />} />
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