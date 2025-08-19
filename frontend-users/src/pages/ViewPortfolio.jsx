import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const ViewPortfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [bachelor, setBachelor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const portfolioRes = await axiosInstance.get("/api/worker/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolio(portfolioRes.data);
        setStatusCode(null);
      } catch (err) {
        setStatusCode(err.response?.status || 500);
      }

      try {
        const badgeRes = await axiosInstance.get("/api/tesda/badge", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBachelor(badgeRes.data?.badge || null);
      } catch (err) {
        console.warn("Badge fetch failed:", err.response?.status);
        setBachelor(null); // Explicitly set to null if badge not found
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-blue-700">Loading portfolio...</div>;
  }

  if (statusCode === 404 || !portfolio?.workerId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-300 text-center max-w-sm">
          <h2 className="text-xl font-bold text-blue-800 mb-2">No Portfolio Found</h2>
          <p className="text-gray-700 mb-4">You currently have no portfolio set up.</p>
          <button
            onClick={() => navigate("/worker/portfolio/create")}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Portfolio
          </button>
        </div>
      </div>
    );
  }

  const worker = portfolio.workerId;

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-6">
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-blue-300 relative">
        <div className="top-4 left-4 mb-2">
          <button
            onClick={() => navigate("/worker-dashboard")}
            className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <hr />
        

        {/* Edit Button */}
        <div className="absolute top-20 right-4">
          <button
            onClick={() => navigate("/worker/portfolio/edit")}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ✏️ Edit Portfolio
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={worker?.profilePicture || "/default-profile.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border border-blue-300"
          />
          <div>
            <h2 className="text-2xl font-bold text-blue-800">
              {worker?.firstName} {worker?.lastName}
            </h2>
            <p className="text-sm text-gray-600">Age: {worker?.age}</p>
            <p className="text-sm text-gray-600">Sex: {worker?.sex}</p>
            <p className="text-sm text-gray-600">Nationality: {worker?.nationality}</p>

            <div className="mt-2 flex items-center gap-3">
              {bachelor?._id ? (
                <span className="text-green-800 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full border border-green-300">
                  🎓 Certified Tumana Bachelor
                </span>
              ) : (
                <span className="text-gray-500 text-sm italic">Not yet certified</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Section */}
        {portfolio.workerAddress && (
          <div className="mt-4 mb-5">
            <h3 className="text-md font-semibold text-gray-800 mb-1">Address</h3>
            <p className="text-sm text-gray-600">
              {portfolio.workerAddress.street && `${portfolio.workerAddress.street}, `}
              {portfolio.workerAddress.barangay && `${portfolio.workerAddress.barangay}, `}
              {portfolio.workerAddress.cityOrMunicipality && `${portfolio.workerAddress.cityOrMunicipality}, `}
              {portfolio.workerAddress.province}
            </p>

            <hr />

            {/* Contact Info */}
            <div className="mt-2 space-y-1">
              {portfolio.workerAddress.email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {portfolio.workerAddress.email}
                </p>
              )}
              {portfolio.workerAddress.telephone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telephone:</span> {portfolio.workerAddress.telephone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Skill Types */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Skill Types</h3>
          <div className="flex flex-wrap gap-2">
            {portfolio.skillTypes.map((type, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-300"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills</h3>
          <ul className="space-y-3">
            {portfolio.skills.map((skill, index) => (
              <li key={index} className="border border-gray-200 rounded p-3">
                <p className="font-medium text-blue-700">{skill.skillName}</p>
                {skill.skillDescription && (
                  <p className="text-sm text-gray-700 mt-1">{skill.skillDescription}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ViewPortfolio;