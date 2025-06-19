import { useState } from "react";
import { useNavigate } from "react-router-dom";
import digitalIcon from "../assets/digital-tumana-icon.png";

const AdminSidebar = ({ expanded, setExpanded }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div
      className={`bg-white h-screen shadow-md fixed top-0 left-0 z-30 transition-all duration-300 ${
        expanded ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200">
        <img
          src={digitalIcon}
          alt="Digital Tumana"
          className="h-8 w-auto cursor-pointer"
          onClick={() => navigate("/admin-dashboard")}
        />
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="text-sky-900 text-xl font-bold"
          >
            ⮜
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col space-y-1">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="text-left px-4 py-2 hover:bg-teal-100 text-sky-900 font-medium"
        >
          {expanded ? "Dashboard" : "🏠"}
        </button>
        <button
          onClick={() => navigate("/admin-account")}
          className="text-left px-4 py-2 hover:bg-teal-100 text-sky-900 font-medium"
        >
          {expanded ? "Account" : "👤"}
        </button>
        <button
          onClick={handleLogout}
          className="text-left px-4 py-2 hover:bg-teal-100 text-red-600 font-medium"
        >
          {expanded ? "Logout" : "🚪"}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;