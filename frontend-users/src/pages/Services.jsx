import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Services = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [workerVerified, setWorkerVerified] = useState(false);
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
      const token = localStorage.getItem("token");

      try {
        const workerRes = await axiosInstance.get("/api/workers/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (workerRes.status === 200) {
          setWorkerVerified(true);

          try {
            const portfolioRes = await axiosInstance.get("/api/worker/portfolio", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (portfolioRes.status === 200 && portfolioRes.data?.workerId) {
              setHasPortfolio(true);
            }
          } catch (portfolioErr) {
            if (portfolioErr.response?.status === 404) {
              setHasPortfolio(false); // Portfolio not found
            }
          }
        }
      } catch (err) {
        try {
          const pendingRes = await axiosInstance.get("/api/workers/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (pendingRes.data?.worker?.status === "pending") {
            setPendingWorker(true);
          }
        } catch {
          setWorkerVerified(false);
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

  const buttonBase =
    "w-full py-2 bg-lime-600 text-white rounded hover:bg-lime-600/75 hover:text-sky-900 transition cursor-pointer";

  return (
    <div className="min-h-screen bg-blue-50">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center pt-10">Available Jobs</h2>

      {/* Sidebar: Filters + Worker Status */}
      <aside className="fixed top-25 left-4 w-64 bg-white shadow-md p-4 max-h-screen overflow-y-auto">
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

        {!workerVerified && !pendingWorker ? (
          <button onClick={() => navigate("/worker-registration")} className={buttonBase}>
            Become a Worker
          </button>
        ) : pendingWorker ? (
          <div className="w-full py-2 text-center bg-yellow-100 text-yellow-800 rounded border border-yellow-300 font-semibold">
            ⏳ Waiting for Verification
          </div>
        ) : !hasPortfolio ? (
          <button onClick={() => navigate("/worker/portfolio/create")} className={buttonBase}>
            Create Portfolio
          </button>
        ) : (
          <div className="w-full py-2 text-center text-blue-800 rounded font-semibold">
            ✅ Verified Worker

            <div className="mt-8 border-t pt-4">
              <button
                onClick={() => navigate("/jobs/job-application/pending")}
                className={buttonBase}
              >
                Pending Applications
              </button>
            </div>

            <div className="mt-8 border-t pt-4">
              <button
                onClick={() => navigate("/jobs/job-application/waiting-to-confirm")}
                className={buttonBase}
              >
                Accepted Applications
              </button>
            </div>

            <div className="mt-8 border-t pt-4">
              <button
                onClick={() => navigate("/jobs/job-application/ongoing-jobs")}
                className={buttonBase}
              >
                Ongoing Jobs
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
                    className={buttonBase + " mt-3"}
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
