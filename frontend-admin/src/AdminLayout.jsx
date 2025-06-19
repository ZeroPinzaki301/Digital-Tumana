import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";

const AdminLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="flex min-h-screen bg-teal-200">
      <AdminSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <div className={`flex-1 transition-all ml-${sidebarExpanded ? "64" : "16"}`}>
        {/* Header */}
        <div className="bg-white p-4 shadow-md flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="text-sky-900 text-2xl">
            ☰
          </button>
          <h1 className="text-xl font-bold text-sky-900">Admin Panel</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;