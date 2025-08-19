import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyReset from "./pages/VerifyReset";
import ResetPassword from "./pages/ResetPassword";
import SellerRegister from "./pages/SellerRegister";
import SellerBalanceOverview from "./pages/SellerBalanceOverview";
import SellerBalanceCreate from "./pages/SellerBalanceCreate";
import PendingSellerNotice from "./pages/PendingSellerNotice";
import AffiliateRegistrationOptions from "./pages/AffiliateRegistrationOptions";
import AffiliateDashboards from "./pages/AffiliateDashboards";
import SellerDashboard from "./pages/SellerDashboard";
import SellerAddressPage from "./pages/SellerAddressPage";
import WorkerRegister from "./pages/WorkerRegsiter";
import EmployerRegister from "./pages/EmployerRegister";
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
import SellerOngoingOrder from "./pages/SellerOngoingOrder";
import AllSellerOngoingOrders from "./pages/AllSellerOngoingOrders";
import SellerWithdrawal from "./pages/SellerWithdrawal";
import OngoingOrdersPage from "./pages/OngoingOrders";
import OrderHistoryPage from "./pages/OrderHistory";
import Learn from "./pages/Learn";
import TesdaEnroll from "./pages/TesdaEnroll";
import TesdaEnrollmentStatus from "./pages/TesdaEnrollmentStatus";
import EmployerJobs from "./pages/EmployerJobs";
import EmployerAddJob from "./pages/EmployerAddJob";
import EmployerJobDetail from "./pages/EmployerJobDetails";
import EmployerEditJob from "./pages/EmployerEditJob";
import Services from "./pages/Services";
import CreatePortfolio from "./pages/CreatePortfolio";
import ViewPortfolio from "./pages/ViewPortfolio";
import JobDetail from "./pages/JobDetails";
import JobApplicationPage from "./pages/JobApplicationPage";
import PendingApplicationsPage from "./pages/PendingApplicationsPage";
import PendingEmployerApplications from "./pages/PendingEmployerApplications";
import ViewApplicantDetails from "./pages/ViewApplicantDetails";
import WorkerConfirmationApplications from "./pages/WorkerConfirmationApplications";
import EmployerOngoingJobs from "./pages/EmployerOngoingJobs";
import WorkerOngoingJobs from "./pages/WorkerOngoingJobs";

import KaritonServiceLogin from "./kariton service/KaritonServiceLogin";
import KaritonServiceDashboard from "./kariton service/KaritonServiceDashboard";
import RiderDeliveryRequests from "./kariton service/RiderDeliveryRequests";
import RiderDeliveryDetails from "./kariton service/RiderDeliveryDetail";
import RiderDeliveryHistory from "./kariton service/RiderDeliveryHistory";

import "./App.css";

function AppContent() {
  const location = useLocation();

  const hiddenNavbarRoutes = [
    "/kariton-service/login",
    "/kariton-service/rider/dashboard",
    "/kariton-service/rider/delivery-requests",
    "/kariton/order/:orderId",
    "/kariton-service/rider/delivery-history"
  ];

  const showNavbar = !hiddenNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={showNavbar ? "pt-16 min-h-screen" : "min-h-screen"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/services" element={<Services />} />
          <Route path="/learn/tesda/enroll" element={<TesdaEnroll />} />
          <Route path="/learn/tesda/enroll/status" element={<TesdaEnrollmentStatus />} />
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
          <Route path="/seller-balance" element={<SellerBalanceOverview />} />
          <Route path="/seller-balance/create" element={<SellerBalanceCreate />} />
          <Route path="/seller-balance/withdraw" element={<SellerWithdrawal />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/job-applications/pending" element={<PendingEmployerApplications />} />
          <Route path="/employer/jobs/ongoing" element={<EmployerOngoingJobs />} />
          <Route path="/employer/job-application/applicant-details/:workerId" element={<ViewApplicantDetails />} />
          <Route path="/seller-address" element={<SellerAddressPage />} />
          <Route path="/employer-address" element={<EmployerAddressPage />} />
          <Route path="/worker-address" element={<WorkerAddressPage />} />
          <Route path="/seller-products" element={<SellerProducts />} />
          <Route path="/seller-product/:productId" element={<SellerProductDetail />} />
          <Route path="/seller-add-product" element={<SellerAddProduct />} />
          <Route path="/seller-edit-product/:productId" element={<SellerEditProduct />} />
          <Route path="/employer-jobs" element={<EmployerJobs />} />
          <Route path="/employer-add-job" element={<EmployerAddJob />} />
          <Route path="/employer-job/:jobId" element={<EmployerJobDetail />} />
          <Route path="/employer-edit-job/:jobId" element={<EmployerEditJob />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:productId" element={<MarketplaceProductDetail />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route path="/my-cart" element={<CartPage />} />
          <Route path="/order-preview/:productId" element={<OrderPreviewPage />} />
          <Route path="/cart-order-preview" element={<CartOrderPreviewPage />} />
          <Route path="/order-requests" element={<OrderRequestsPage />} />
          <Route path="/order-request-summary/:orderId" element={<OrderRequestSummaryPage />} />
          <Route path="/seller-ongoing-order/:orderId" element={<SellerOngoingOrder />} />
          <Route path="/seller-ongoing-orders" element={<AllSellerOngoingOrders />} />
          <Route path="/customer/ongoing-orders" element={<OngoingOrdersPage />} />
          <Route path="/customer/order-history" element={<OrderHistoryPage />} />
          <Route path="/worker/portfolio/create" element={<CreatePortfolio />} />
          <Route path="/worker/portfolio" element={<ViewPortfolio />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/jobs/job-application/:jobId" element={<JobApplicationPage />} />
          <Route path="/jobs/job-application/pending" element={<PendingApplicationsPage />} />
          <Route path="/jobs/job-application/waiting-to-confirm" element={<WorkerConfirmationApplications />} />
          <Route path="/jobs/job-application/ongoing-jobs" element={<WorkerOngoingJobs />} />

          {/* Kariton Service Routes */}
          <Route path="/kariton-service/login" element={<KaritonServiceLogin />} />
          <Route path="/kariton-service/rider/dashboard" element={<KaritonServiceDashboard />} />
          <Route path="/kariton-service/rider/delivery-requests" element={<RiderDeliveryRequests />} />
          <Route path="/kariton-service/rider/delivery-history" element={<RiderDeliveryHistory />} />
          <Route path="/kariton/order/:orderId" element={<RiderDeliveryDetails />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;