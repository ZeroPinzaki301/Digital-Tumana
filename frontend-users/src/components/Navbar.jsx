import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import karitonServiceIcon from "../assets/KaritonServiceIcon.png";
import axiosInstance from "../utils/axiosInstance";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showKaritonDropdown, setShowKaritonDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
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
      console.error("Failed to fetch user in Navbar:", err);
    }
  };

  useEffect(() => {
    fetchUserData();

    const handleStorageChange = () => {
      fetchUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location.pathname]);

  // ✅ Only close modal if click is outside profile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowKaritonDropdown(false);
        setShowModal(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userFirstName");
    setUser(null);
    setShowModal(false);
    navigate("/login");
  };

  const showProfileIcon =
    !user?.profilePicture ||
    user.profilePicture.includes("default-profile.png");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-lime-800 shadow-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-2 border-lime-200/25">
      {/* Logo */}
      <Link to="/" className="flex items-center">
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
        <Link to="/" className="font-medium text-sm md:text-base lg:text-lg hover:text-green-300">
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
              onClick={() => setMobileMenuOpen(false)}
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