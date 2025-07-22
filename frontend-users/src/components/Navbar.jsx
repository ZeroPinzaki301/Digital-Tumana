import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import digitalTumanaIcon from "../assets/digital-tumana-icon.png";
import axiosInstance from "../utils/axiosInstance";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userFirstName");
    setUser(null);
    setShowModal(false);
    navigate("/login");
  };

  const showProfileIcon = !user?.profilePicture || 
                         user.profilePicture.includes("default-profile.png");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-lime-600 to-emerald-100 shadow-md px-6 py-4 flex items-center justify-between border-b-2 border-lime-200/25">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img src={digitalTumanaIcon} alt="Digital Tumana" className="w-12 h-12" />
      </Link>

      {/* Middle Links */}
      <div className="text-emerald-800/75 flex space-x-10 tracking-[.25em]">
        <Link to="/" className="font-extrabold text-[1.25em] hover:text-emerald-800">Home</Link>
        <Link to="/marketplace" className="font-extrabold text-[1.25em] hover:text-emerald-800">Marketplace</Link>
        <Link to="/services" className="font-extrabold text-[1.25em] hover:text-emerald-800">Services</Link>
        <Link to="/learn" className="font-extrabold text-[1.25em] hover:text-emerald-800">Learn</Link>
      </div>

      {/* Right Side */}
      <div className="relative">
        {user ? (
          <>
            <button
              onClick={() => setShowModal(!showModal)}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-lime-700 bg-white"
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
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-4 z-50">
                <div className="flex flex-col items-center">
                  {!showProfileIcon ? (
                    <img
                      src={user.profilePicture}
                      alt="User"
                      className="w-20 h-20 rounded-full object-cover border-2 border-lime-700 mb-3"
                    />
                  ) : (
                    <FaUser className="text-5xl text-lime-700 mb-3" />
                  )}
                  <h2 className="text-lg font-semibold text-lime-700 mb-2">{user.firstName}</h2>
                  <Link to="/account" onClick={() => setShowModal(false)}>
                    <button className="w-full py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition mb-2">
                      Go to Account
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            className="w-12 h-12 flex items-center justify-center text-white bg-lime-700 rounded-full hover:bg-lime-800 transition"
          >
            <h1>Login</h1>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;