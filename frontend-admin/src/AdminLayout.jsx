import AdminSidebar from "./components/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-sky-900">
      <AdminSidebar />
      <div className="flex-1 ml-20 transition-all duration-300 group-hover/sidebar:ml-64 bg-white">
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;