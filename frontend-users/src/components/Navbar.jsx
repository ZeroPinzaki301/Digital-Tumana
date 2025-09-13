import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaUser, FaBars, FaTimes, FaBell } from "react-icons/fa";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import karitonServiceIcon from "../assets/KaritonServiceIcon.png";
import axiosInstance from "../utils/axiosInstance";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showKaritonDropdown, setShowKaritonDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  
  // Cache for notification status to prevent excessive API calls
  const notificationCacheRef = useRef({ 
    timestamp: 0, 
    data: false,
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
  });

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setHasNotifications(false);
      return;
    }

    try {
      const res = await axiosInstance.get("/api/users/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { _id, firstName, profilePicture } = res.data;
      setUser({
        id: _id,
        firstName,
        profilePicture,
      });
    } catch (err) {
      setUser(null);
      setHasNotifications(false);
      console.error("Failed to fetch user in Navbar:", err);
    }
  }, []);

  // Optimized notification fetching with caching and debouncing
  const fetchNotificationStatus = useCallback(async (force = false) => {
    const token = localStorage.getItem("token");
    if (!token || notificationLoading) return;

    // Check cache first
    const now = Date.now();
    const cache = notificationCacheRef.current;
    
    if (!force && (now - cache.timestamp) < cache.CACHE_DURATION) {
      setHasNotifications(cache.data);
      return;
    }

    try {
      setNotificationLoading(true);
      
      // Use Promise.allSettled to handle partial failures gracefully
      // Now includes all notification types: TESDA, orders, job applications, and worker job applications
      const results = await Promise.allSettled([
        axiosInstance.get("/api/notification/tesda", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/notification/order", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/notification/job-applications", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/notification/worker-job-applications", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      let hasTesdaNotifications = false;
      let hasOrderNotifications = false;
      let hasJobApplicationNotifications = false;
      let hasWorkerJobApplicationNotifications = false;
      
      // Handle TESDA notifications
      if (results[0].status === 'fulfilled' && results[0].value.data.success) {
        hasTesdaNotifications = results[0].value.data.data?.length > 0;
      }
      
      // Handle Order notifications
      if (results[1].status === 'fulfilled' && results[1].value.data.success) {
        hasOrderNotifications = results[1].value.data.data?.length > 0;
      }
      
      // Handle Job Application notifications (for employers)
      if (results[2].status === 'fulfilled' && results[2].value.data.success) {
        hasJobApplicationNotifications = results[2].value.data.data?.length > 0;
      }
      
      // Handle Worker Job Application notifications (for workers)
      if (results[3].status === 'fulfilled' && results[3].value.data.success) {
        hasWorkerJobApplicationNotifications = results[3].value.data.data?.length > 0;
      }
      
      const hasAnyNotifications = hasTesdaNotifications || 
                                 hasOrderNotifications || 
                                 hasJobApplicationNotifications || 
                                 hasWorkerJobApplicationNotifications;
      
      // Update cache
      notificationCacheRef.current = {
        timestamp: now,
        data: hasAnyNotifications,
        CACHE_DURATION: cache.CACHE_DURATION
      };
      
      setHasNotifications(hasAnyNotifications);
    } catch (err) {
      console.error("Error checking notifications:", err);
      setHasNotifications(false);
    } finally {
      setNotificationLoading(false);
    }
  }, [notificationLoading]);

  // Debounced notification refresh
  const refreshNotifications = useCallback(() => {
    fetchNotificationStatus(true);
  }, [fetchNotificationStatus]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch notifications only when user changes (login/logout)
  useEffect(() => {
    if (user?.id) {
      fetchNotificationStatus();
    } else {
      setHasNotifications(false);
      // Clear cache when user logs out
      notificationCacheRef.current = { 
        timestamp: 0, 
        data: false,
        CACHE_DURATION: 5 * 60 * 1000 
      };
    }
  }, [user?.id, fetchNotificationStatus]);

  // Handle storage changes (for login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        fetchUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUserData]);

  // Handle clicks outside profile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowKaritonDropdown(false);
        setShowModal(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userFirstName");
    setUser(null);
    setHasNotifications(false);
    setShowModal(false);
    
    // Clear notification cache
    notificationCacheRef.current = { 
      timestamp: 0, 
      data: false,
      CACHE_DURATION: 5 * 60 * 1000 
    };
    
    navigate("/login");
  }, [navigate]);

  // Handle logo and home clicks
  const handleLogoClick = useCallback((e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  const handleHomeClick = useCallback((e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle notification bell click
  const handleNotificationClick = useCallback(() => {
    navigate("/notifications");
    // Refresh notifications when viewing them
    setTimeout(() => refreshNotifications(), 100);
  }, [navigate, refreshNotifications]);

  const showProfileIcon =
    !user?.profilePicture ||
    user.profilePicture.includes("default-profile.png");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-lime-800 shadow-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-2 border-lime-200/25">
      {/* Logo */}
      <Link 
        to="/" 
        className="flex items-center"
        onClick={handleLogoClick}
      >
        <img
          src={digitalTumanaIcon}
          alt="Digital Tumana"
          className="w-9 h-9 sm:w-11 sm:h-11"
        />
      </Link>

      {/* Burger Menu Button - Mobile Only */}
      <button
        className="sm:hidden text-white text-2xl"
        onClick={(e) => {
          e.stopPropagation();
          setMobileMenuOpen(!mobileMenuOpen);
        }}
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Middle Links - Desktop */}
      <div className="hidden sm:flex text-white space-x-4 md:space-x-8 lg:space-x-12 tracking-[.45em]">
        <Link 
          to="/" 
          className="font-medium text-sm md:text-base lg:text-lg hover:text-green-300"
          onClick={handleHomeClick}
        >
          Home
        </Link>
        <Link to="/marketplace" className="font-medium text-sm md:text-base lg:text-lg hover:text-green-300">
          Marketplace
        </Link>
        <Link to="/services" className="font-medium text-sm md:text-base lg:text-lg hover:text-green-300">
          Services
        </Link>
        <Link to="/learn" className="font-medium text-sm md:text-base lg:text-lg hover:text-green-300">
          Learn
        </Link>
      </div>

      {/* Right Side */}
      <div className="hidden sm:flex relative items-center space-x-4">
        {/* Notification Bell */}
        {user && (
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 text-white cursor-pointer hover:text-green-300 transition relative"
              disabled={notificationLoading}
            >
              <FaBell className={`text-xl ${notificationLoading ? 'animate-pulse' : ''}`} />
              {hasNotifications && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-lime-800 animate-pulse"></span>
              )}
            </button>
          </div>
        )}

        {/* Kariton Service Direct Link */}
        <button
          onClick={() => navigate("/kariton-service/login")}
          className="flex items-center px-3 py-1.5 bg-lime-700 md:px-4 md:py-2 rounded-lg shadow hover:bg-lime-400/25 hover:text-white transition cursor-pointer"
        >
          <img
            src={karitonServiceIcon}
            alt="Kariton Icon"
            title="Kariton Service Login"
            className="w-4 h-4 md:w-5 md:h-5"
          />
        </button>

        {/* Profile or Login */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowModal(!showModal)}
              className="w-10 h-9 md:w-12 md:h-11 rounded-full overflow-hidden border-2 border-lime-700 bg-white cursor-pointer"
            >
              {!showProfileIcon ? (
                <img
                  src={user.profilePicture}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="w-full h-full text-lime-700" />
              )}
            </button>

            {showModal && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <Link
                  to="/account"
                  className="block px-4 py-2 text-gray-700 hover:bg-lime-100"
                  onClick={() => setShowModal(false)}
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-lime-100 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="w-12 h-9 md:w-14 md:h-11 flex items-center justify-center text-white bg-lime-600/25 rounded-md hover:bg-lime-700 transition text-sm md:text-base"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-lime-800 shadow-lg z-50 p-4">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className="font-medium text-white hover:text-green-300 py-2 border-b border-lime-700"
              onClick={handleHomeClick}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="font-medium text-white hover:text-green-300 py-2 border-b border-lime-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/services"
              className="font-medium text-white hover:text-green-300 py-2 border-b border-lime-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/learn"
              className="font-medium text-white hover:text-green-300 py-2 border-b border-lime-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learn
            </Link>

            {/* Mobile Notification Bell */}
            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNotificationClick();
                }}
                className="flex items-center font-medium text-white hover:text-green-300 py-2 border-b border-lime-700 cursor-pointer"
                disabled={notificationLoading}
              >
                <span className={notificationLoading ? 'animate-pulse' : ''}>
                  Notifications
                </span>
                {hasNotifications && (
                  <span className="ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            )}

            {/* Mobile Kariton Service Link */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/kariton-service/login");
              }}
              className="flex items-center justify-center space-x-2 font-medium text-white hover:text-green-300 py-2 border-b border-lime-700 cursor-pointer"
            >
              <img
                src={karitonServiceIcon}
                alt="Kariton Icon"
                className="w-4 h-4"
              />
              <span>Kariton Service</span>
            </button>

            {/* Mobile Profile/Login */}
            {user ? (
              <div className="flex flex-col space-y-3 pt-2">
                <div className="flex items-center space-x-3">
                  {!showProfileIcon ? (
                    <img
                      src={user.profilePicture}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover border-2 border-lime-700"
                    />
                  ) : (
                    <FaUser className="text-3xl text-lime-700 bg-white rounded-full p-1" />
                  )}
                  <span className="text-white font-medium">
                    {user.firstName}
                  </span>
                </div>
                <Link
                  to="/account"
                  className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition text-center cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Account
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-lime-600/75 text-white rounded-lg hover:bg-lime-300 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;