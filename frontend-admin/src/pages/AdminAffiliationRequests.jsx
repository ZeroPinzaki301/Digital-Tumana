import { useNavigate } from "react-router-dom";

const AdminAffiliationRequests = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-emerald-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-sky-900 space-y-4">
        <h2 className="text-2xl font-bold text-sky-900 text-center">Affiliation Request Types</h2>

        <button
          onClick={() => navigate("/admin-seller-requests")}
          className="w-full py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 transition"
        >
          Seller Applications
        </button>

        <button
          onClick={() => navigate("/admin-worker-requests")}
          className="w-full py-2 bg-indigo-100 text-indigo-900 border border-indigo-600 rounded-lg hover:bg-indigo-200 transition"
        >
          Worker Applications
        </button>

        <button
          onClick={() => navigate("/admin-employer-requests")}
          className="w-full py-2 bg-yellow-100 text-yellow-900 border border-yellow-600 rounded-lg hover:bg-yellow-200 transition"
        >
          Employer Applications
        </button>
      </div>
    </div>
  );
};

export default AdminAffiliationRequests;