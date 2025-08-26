import { useNavigate } from "react-router-dom";
import digitalIcon from "../assets/digital-tumana-icon.png";
import { FaTachometerAlt, FaUser, FaSignOutAlt } from "react-icons/fa";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div className="bg-teal-200 h-screen w-[7.5%] fixed top-0 left-0 z-30 shadow-md">
      <div className="flex flex-col items-center py-4 border-b border-gray-200">
        <img
          src={digitalIcon}
          alt="Digital Tumana"
          className="h-8 w-auto cursor-pointer mb-4"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="mt-4 flex flex-col items-center space-y-4">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center p-2 hover:bg-teal-100 text-sky-900 font-medium w-full cursor-pointer"
          title="Dashboard"
        >
          <FaTachometerAlt className="text-lg" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center p-2 hover:bg-teal-100 text-red-600 font-medium w-full cursor-pointer"
          title="Logout"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;