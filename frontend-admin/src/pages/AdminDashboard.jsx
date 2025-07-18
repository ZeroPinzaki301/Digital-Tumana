import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin-users")}
      >
        <span className="text-lg font-semibold text-sky-900">See Users</span>
      </div>

      <div
        className="bg-white rounded-lg shadow-md border border-sky-900 p-6 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition"
        onClick={() => navigate("/admin-affiliation-requests")}
      >
        <span className="text-lg font-semibold text-sky-900">Tumana Affiliation Requests</span>
      </div>
    </div>
  );
};

export default AdminDashboard;