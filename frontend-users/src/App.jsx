import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyReset from "./pages/VerifyReset";
import ResetPassword from "./pages/ResetPassword";
import SellerRegister from "./pages/SellerRegister";
import PendingSellerNotice from "./pages/PendingSellerNotice";
import AffiliateRegistrationOptions from "./pages/AffiliateRegistrationOptions";
import AffiliateDashboards from "./pages/AffiliateDashboards";
import SellerDashboard from "./pages/SellerDashboard";
import SellerAddressPage from "./pages/SellerAddressPage";
import WorkerRegister from "./pages/WorkerRegsiter";
import EmployerRegister from "./pages/EmployerRegister"
import WorkerDashboard from "./pages/WorkerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerAddressPage from "./pages/EmployerAddressPage";
import WorkerAddressPage from "./pages/WorkerAddressPage";
import SellerProducts from "./pages/SellerProducts";
import SellerAddProduct from "./pages/SellerAddProduct";
import SellerProductDetail from "./pages/SellerProductDetail";
import SellerEditProduct from "./pages/SellerEditProduct";
import Marketplace from "./pages/Marketplace";
import MarketplaceProductDetail from "./pages/MarketplaceProductDetails";
import CustomerRegister from "./pages/CustomerRegister";
import CartPage from "./pages/CartPage";
import OrderPreviewPage from "./pages/OrderPreviewPage";
import CartOrderPreviewPage from "./pages/CartOrderPreviewPage";
import OrderRequestsPage from "./pages/OrderRequest";
import OrderRequestSummaryPage from "./pages/OrderRequestSummaryPage";

import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16 min-h-screen"> {/* Added padding-top and min-height */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset" element={<VerifyReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/seller-registration" element={<SellerRegister />} />
          <Route path="/worker-registration" element={<WorkerRegister />} />
          <Route path="/employer-registration" element={<EmployerRegister />} />
          <Route path="/pending-seller-notice" element={<PendingSellerNotice />} />
          <Route path="/affiliate-registration" element={<AffiliateRegistrationOptions />} />
          <Route path="/affiliate-dashboards" element={<AffiliateDashboards />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/seller-address" element={<SellerAddressPage />} />
          <Route path="/employer-address" element={<EmployerAddressPage />} />
          <Route path="/worker-address" element={<WorkerAddressPage />} />
          <Route path="/seller-products" element={<SellerProducts />} />
          <Route path="/seller-product/:productId" element={<SellerProductDetail />} />
          <Route path="/seller-add-product" element={<SellerAddProduct />} />
          <Route path="/seller-edit-product/:productId" element={<SellerEditProduct />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:productId" element={<MarketplaceProductDetail />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route path="/my-cart" element={<CartPage />} />
          <Route path="/order-preview/:productId" element={<OrderPreviewPage />} />
          <Route path="/cart-order-preview" element={<CartOrderPreviewPage />} />
          <Route path="/order-requests" element={<OrderRequestsPage />} />
          <Route path="/order-request-summary/:orderId" element={<OrderRequestSummaryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;