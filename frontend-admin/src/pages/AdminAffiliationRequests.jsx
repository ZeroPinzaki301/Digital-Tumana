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
          disabled
          className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
        >
          Worker Applications (coming soon)
        </button>
        <button
          disabled
          className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
        >
          Employer Applications (coming soon)
        </button>
      </div>
    </div>
  );
};

export default AdminAffiliationRequests;