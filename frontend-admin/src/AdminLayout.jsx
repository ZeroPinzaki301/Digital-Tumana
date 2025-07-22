import AdminSidebar from "./components/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-teal-200">
      <AdminSidebar />
      <div className="flex-1 ml-[7.5%] bg-white">
        {/* Header */}
        <div className="bg-white p-4 shadow-md sticky top-0 z-10">
          <h1 className="text-xl font-bold text-sky-900">Admin Panel</h1>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;