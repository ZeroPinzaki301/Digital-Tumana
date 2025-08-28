import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import digitalIcon from "../assets/digital-tumana-icon.png";
import { 
  FaTachometerAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaUsers, 
  FaShoppingCart, 
  FaShoppingBasket, 
  FaMoneyBillWave, 
  FaGraduationCap,
  FaBell
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [hasMarketFlowActivity, setHasMarketFlowActivity] = useState(false);
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

        // Check market flow activity
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
        console.error("Error fetching admin sidebar data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const menuItems = [
    { 
      id: "dashboard", 
      icon: <FaTachometerAlt className="text-lg" />, 
      label: "Dashboard", 
      onClick: () => navigate("/"), 
      notification: false 
    },
    { 
      id: "affiliation", 
      icon: <FaUsers className="text-lg" />, 
      label: "Admission", 
      onClick: () => navigate("/admin-affiliation-requests"), 
      notification: hasPendingAffiliations 
    },
    { 
      id: "market", 
      icon: <FaShoppingCart className="text-lg" />, 
      label: "Market Flow", 
      onClick: () => navigate("/admin-ongoing-orders"), 
      notification: hasMarketFlowActivity 
    },
    { 
      id: "kariton", 
      icon: <FaShoppingBasket className="text-lg" />, 
      label: "Kariton", 
      onClick: () => navigate("/admin-kariton-service"), 
      notification: false 
    },
    { 
      id: "sellerbank", 
      icon: <FaMoneyBillWave className="text-lg" />, 
      label: "Seller Bank", 
      onClick: () => navigate("/admin/seller-balances"), 
      notification: false 
    },
    { 
      id: "tesda", 
      icon: <FaGraduationCap className="text-lg" />, 
      label: "TESDA", 
      onClick: () => navigate("/admin/tesda/enrollment/pending"), 
      notification: false 
    },
    { 
      id: "logout", 
      icon: <FaSignOutAlt className="text-lg" />, 
      label: "Logout", 
      onClick: handleLogout, 
      notification: false,
      isLogout: true 
    },
  ];

  return (
    <div className="bg-gradient-to-b from-sky-800 to-blue-900 h-screen w-20 fixed top-0 left-0 z-30 shadow-xl transition-all duration-300 hover:w-64 group/sidebar overflow-hidden">
      {/* Logo Section */}
      <div className="flex flex-col items-center py-6 border-b border-sky-700">
        <img
          src={digitalIcon}
          alt="Digital Tumana"
          className="h-10 w-auto cursor-pointer transition-transform duration-300 hover:scale-110"
          onClick={() => navigate("/")}
        />
        <span className="text-white text-xs mt-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Admin Portal
        </span>
      </div>

      {/* Menu Items */}
      <div className="mt-6 flex flex-col space-y-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex items-center cursor-pointer p-3 rounded-xl transition-all duration-300 w-full group/item
              ${item.isLogout 
                ? "text-red-300 hover:bg-red-500/20 hover:text-red-100 mt-8" 
                : "text-sky-200 hover:bg-sky-700 hover:text-white"
              }`}
            title={item.label}
          >
            <div className="relative">
              {item.icon}
              {item.notification && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
            <span className="ml-4 text-sm font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {item.label}
            </span>
            {item.notvention && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications Summary (visible on hover) */}
      <div className="absolute bottom-4 left-3 right-3 bg-sky-700/50 rounded-lg p-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
        <div className="flex items-center text-sky-100 mb-2">
          <FaBell className="text-sm mr-2" />
          <span className="text-xs font-medium">Notifications</span>
        </div>
        <div className="space-y-1">
          {hasPendingAffiliations && (
            <div className="text-xs text-red-200 flex items-center">
              <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></span>
              Pending affiliations
            </div>
          )}
          {hasMarketFlowActivity && (
            <div className="text-xs text-red-200 flex items-center">
              <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></span>
              Active orders
            </div>
          )}
          {hasPendingCustomerVerifications && (
            <div className="text-xs text-red-200 flex items-center">
              <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></span>
              Customer verifications
            </div>
          )}
          {!hasPendingAffiliations && !hasMarketFlowActivity && !hasPendingCustomerVerifications && (
            <div className="text-xs text-sky-200">All caught up!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;