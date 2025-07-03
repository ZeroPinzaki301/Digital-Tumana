import { useNavigate } from "react-router-dom";
import digitalIcon from "../assets/digital-tumana-icon.png";
import { FaBars, FaChevronLeft, FaTachometerAlt, FaUser, FaSignOutAlt } from "react-icons/fa";

const AdminSidebar = ({ expanded, setExpanded }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div
      className={`bg-teal-200 h-screen shadow-md fixed top-0 left-0 z-30 transition-all duration-300 ${
        expanded ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200">
        {expanded ? (
          <>
            <img
              src={digitalIcon}
              alt="Digital Tumana"
              className="h-8 w-auto cursor-pointer"
              onClick={() => navigate("/admin-dashboard")}
            />
            <button
              onClick={() => setExpanded(false)}
              className="text-sky-900 text-xl font-bold"
            >
              <FaChevronLeft />
            </button>
          </>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="text-sky-900 text-2xl mx-auto"
          >
            <FaBars />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center md:items-stretch space-y-1">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-3 px-4 py-2 hover:bg-teal-100 text-sky-900 font-medium w-full justify-start"
        >
          <FaTachometerAlt className="text-lg" />
          {expanded && "Dashboard"}
        </button>
        <button
          onClick={() => navigate("/admin-account")}
          className="flex items-center gap-3 px-4 py-2 hover:bg-teal-100 text-sky-900 font-medium w-full justify-start"
        >
          <FaUser className="text-lg" />
          {expanded && "Account"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 hover:bg-teal-100 text-red-600 font-medium w-full justify-start"
        >
          <FaSignOutAlt className="text-lg" />
          {expanded && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;