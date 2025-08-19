import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Services = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [worker, setWorker] = useState(null);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [pendingWorker, setPendingWorker] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get("/api/jobs");
        setJobs(res.data.jobs);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      }
    };

    const fetchWorkerStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const workerRes = await axiosInstance.get("/api/workers/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorker(workerRes.data.worker);

        const portfolioRes = await axiosInstance.get("/api/worker/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasPortfolio(!!portfolioRes.data?.workerId);
      } catch (err) {
        try {
          const token = localStorage.getItem("token");
          const pendingRes = await axiosInstance.get("/api/workers/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (pendingRes.data?.worker?.status === "pending") {
            setPendingWorker(true);
          }
        } catch {
          setWorker(null);
          setPendingWorker(false);
        }
      }
    };

    fetchJobs();
    fetchWorkerStatus();
  }, []);

  const filteredJobs = jobs
    .filter((job) => {
      const nameMatches = job.jobName.toLowerCase().includes(searchTerm.toLowerCase());
      const salaryMin = minSalary === "" || job.minSalary >= parseFloat(minSalary);
      const salaryMax = maxSalary === "" || job.maxSalary <= parseFloat(maxSalary);
      return nameMatches && salaryMin && salaryMax;
    })
    .sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-blue-50">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center pt-10">Available Jobs</h2>

      {/* Sidebar: Filters + Worker Status */}
      <aside className="fixed top-25 left-4 w-64 bg-white border border-blue-300 rounded-lg shadow-md p-4 max-h-screen overflow-y-auto">
        <h2 className="text-lg font-bold text-blue-800 mb-4">Filters</h2>

        <input
          type="text"
          placeholder="🔍 Search by job name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <label className="text-sm font-semibold text-blue-700 mb-2 block">Salary Range (₱):</label>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            placeholder="Min"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <hr className="my-4" />
        <h2 className="text-lg font-bold text-blue-800 mb-2">Worker Status</h2>

        {!worker && !pendingWorker ? (
          <button
            onClick={() => navigate("/worker-registration")}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Become a Worker
          </button>
        ) : pendingWorker ? (
          <div className="w-full py-2 text-center bg-yellow-100 text-yellow-800 rounded border border-yellow-300 font-semibold">
            ⏳ Waiting for Verification
          </div>
        ) : !hasPortfolio ? (
          <button
            onClick={() => navigate("/worker/portfolio/create")}
            className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Create Portfolio
          </button>
        ) : (
          <div className="w-full py-2 text-center text-blue-800 rounded font-semibold">
            ✅ Verified Worker

            <div className="mt-8 border-t pt-4">
              <button
                onClick={() => navigate("/jobs/job-application/pending")}
                className="w-full py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                <span>Pending Applications</span>
              </button>
            </div>

            <div className="mt-8 border-t pt-4">
              <button
                onClick={() => navigate("/jobs/job-application/waiting-to-confirm")}
                className="w-full py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                <span>Accepted Applications</span>
              </button>
            </div>

            <div className="mt-8 border-t pt-4">
              <button
                onClick={() => navigate("/jobs/job-application/ongoing-jobs")}
                className="w-full py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                <span>Ongoing Jobs</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="pl-[272px] pr-4 ml-2">
        {filteredJobs.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">No matching services found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-blue-300 rounded-lg shadow hover:shadow-md transition duration-200 overflow-hidden"
              >
                <img
                  src={job.jobImage}
                  alt={job.jobName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-1">
                  <h3 className="text-lg font-bold text-blue-800">{job.jobName}</h3>
                  <p className="text-sm text-gray-700">
                    ₱{job.minSalary} – ₱{job.maxSalary} / {job.salaryFrequency}
                  </p>
                  <p className="text-xs font-semibold">
                    Status:{" "}
                    <span className={job.isAvailable ? "text-green-700" : "text-red-700"}>
                      {job.isAvailable ? "Open" : "Closed"}
                    </span>
                  </p>
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="mt-3 w-full py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;