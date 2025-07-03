import { useNavigate } from "react-router-dom";

const AffiliateDashboards = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-lg shadow-lg border border-lime-700 text-center">
        <h2 className="text-2xl font-bold text-lime-700 mb-4">Affiliate Dashboards</h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/seller-dashboard")}
            className="w-full py-2 bg-emerald-100 text-sky-900 border border-sky-900 rounded-lg hover:bg-emerald-200 transition"
          >
            Seller Dashboard
          </button>

          <button
            onClick={() => navigate("/worker-dashboard")}
            className="w-full py-2 bg-yellow-100 text-yellow-900 border border-yellow-600 rounded-lg hover:bg-yellow-200 transition"
          >
            Worker Dashboard
          </button>

          <button
            onClick={() => navigate("/employer-dashboard")}
            className="w-full py-2 bg-indigo-100 text-indigo-900 border border-indigo-600 rounded-lg hover:bg-indigo-200 transition"
          >
            Employer Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboards;