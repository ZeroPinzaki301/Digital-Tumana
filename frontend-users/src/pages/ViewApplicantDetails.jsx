import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const ViewApplicantDetails = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axiosInstance.get(`/api/employer/jobs/${workerId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        setStatusCode(null);
      } catch (err) {
        setStatusCode(err.response?.status || 500);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [workerId]);

  if (loading) {
    return <div className="p-6 text-center text-blue-700">Loading applicant details...</div>;
  }

  if (statusCode === 404 || !data?.worker) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-300 text-center max-w-sm">
          <h2 className="text-xl font-bold text-blue-800 mb-2">Applicant Not Found</h2>
          <p className="text-gray-700 mb-4">We couldn't find details for this applicant.</p>
          <button
            onClick={() => navigate("/employer/job-applications/pending")}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Pending Applications
          </button>
        </div>
      </div>
    );
  }

  const { worker, portfolio, address, isTumanaBachelor } = data;

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-blue-300 relative">
        <div className="top-4 left-4 mb-2">
          <button
            onClick={() => navigate("/employer/job-applications/pending")}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Pending Applications
          </button>
        </div>

        <hr />

        {/* Header */}
        <div className="flex items-center gap-6 mb-6 mt-4">
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
              {isTumanaBachelor ? (
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
        {address && (
          <div className="mt-4 mb-5">
            <h3 className="text-md font-semibold text-gray-800 mb-1">Address</h3>
            <p className="text-sm text-gray-600">
              {address.street && `${address.street}, `}
              {address.barangay && `${address.barangay}, `}
              {address.cityOrMunicipality && `${address.cityOrMunicipality}, `}
              {address.province}
            </p>

            <hr />

            <div className="mt-2 space-y-1">
              {address.email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {address.email}
                </p>
              )}
              {address.telephone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telephone:</span> {address.telephone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Skill Types */}
        {portfolio?.skillTypes?.length > 0 && (
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
        )}

        {/* Skills */}
        {portfolio?.skills?.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default ViewApplicantDetails;