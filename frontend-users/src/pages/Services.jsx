import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import servicesHero from "../assets/ServicesPage-Image/magsasaka.jpg";

const Services = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [selectedSkillTypes, setSelectedSkillTypes] = useState([]);
  const [workerVerified, setWorkerVerified] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [pendingWorker, setPendingWorker] = useState(false);
  const [userSkillTypes, setUserSkillTypes] = useState([]);

  const navigate = useNavigate();

  const skillOptions = [
    "Plants",
    "Fertilizers",
    "Animals",
    "Machinery",
    "Irrigation",
    "Harvesting",
    "Storage",
    "Other"
  ];

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
              // Set user's skill types from portfolio
              if (portfolioRes.data.skillTypes && portfolioRes.data.skillTypes.length > 0) {
                setUserSkillTypes(portfolioRes.data.skillTypes);
              }
            }
          } catch (portfolioErr) {
            if (portfolioErr.response?.status === 404) {
              setHasPortfolio(false);
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

  const handleSkillTypeChange = (skillType) => {
    setSelectedSkillTypes(prev =>
      prev.includes(skillType)
        ? prev.filter(skill => skill !== skillType)
        : [...prev, skillType]
    );
  };

  const applyRecommendedFilter = () => {
    if (userSkillTypes.length > 0) {
      setSelectedSkillTypes(userSkillTypes);
    }
  };

  const clearFilters = () => {
    setSelectedSkillTypes([]);
    setSearchTerm("");
    setMinSalary("");
    setMaxSalary("");
  };

  const filteredJobs = jobs
    .filter((job) => {
      const nameMatches = job.jobName.toLowerCase().includes(searchTerm.toLowerCase());
      const salaryMin = minSalary === "" || job.minSalary >= parseFloat(minSalary);
      const salaryMax = maxSalary === "" || job.maxSalary <= parseFloat(maxSalary);
      
      // Skill type filtering - show all if none selected, otherwise filter by selected skills
      const skillMatches = selectedSkillTypes.length === 0 || 
        (job.skillTypes && job.skillTypes.some(skill => 
          selectedSkillTypes.includes(skill)
        ));
      
      return nameMatches && salaryMin && salaryMax && skillMatches;
    })
    .sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-sky-50 pb-16">
      {/* ✅ Hero Section */}
      <section className="relative w-full h-25 md:h-72 lg:h-80">
        <img
          src={servicesHero}
          alt="Services Hero"
          className="w-full h-full object-cover object-[20%_30%]"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white px-4">
          <h1 className="absolute bottom-4 right-4 text-4xl md:text-7xl font-bold drop-shadow-lg">
            Tumana Services
          </h1>
        </div>
      </section>

      {/* ✅ Mobile Filters */}
      <div className="md:hidden px-4 pt-4">
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search by job name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
          />

          <details className="w-full max-w-md">
            <summary className="cursor-pointer bg-sky-600 text-white px-4 py-2 rounded-lg text-center">
              Show Filters
            </summary>
            <div className="mt-2 bg-white border border-sky-300 rounded-lg p-4">
              {/* Recommended Filter Button for Mobile */}
              {hasPortfolio && userSkillTypes.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={applyRecommendedFilter}
                    className="w-full cursor-pointer py-2 bg-green-600 text-white font-medium rounded hover:bg-green-500 transition mb-2"
                  >
                    Show Recommended Jobs
                  </button>
                  <button
                    onClick={clearFilters}
                    className="w-full cursor-pointer py-2 bg-gray-500 text-white font-medium rounded hover:bg-gray-400 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
              
              <label className="text-sm font-semibold text-sky-700 mb-2 block">Salary Range (₱):</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              
              {/* Mobile Skill Types Filter */}
              <label className="text-sm font-semibold text-sky-700 mb-2 block">Skill Types:</label>
              <div className="grid grid-cols-2 gap-2">
                {skillOptions.map(skill => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSkillTypes.includes(skill)}
                      onChange={() => handleSkillTypeChange(skill)}
                      className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="flex gap-6 px-4 pt-5">
        {/* ✅ Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border border-sky-300 rounded-lg shadow-md p-4 h-fit">
          <h2 className="text-lg font-bold text-sky-800 mb-4">Filters</h2>

          {/* Recommended Filter Button for Desktop */}
          {hasPortfolio && userSkillTypes.length > 0 && (
            <div className="mb-4">
              <button
                onClick={applyRecommendedFilter}
                className="w-full cursor-pointer py-2 bg-green-600 text-white font-medium rounded hover:bg-green-500 transition mb-2"
              >
                Show Recommended Jobs
              </button>
              <button
                onClick={clearFilters}
                className="w-full cursor-pointer py-2 bg-gray-500 text-white font-medium rounded hover:bg-gray-400 transition"
              >
                Clear Filters
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="🔍 Search by job name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
          />

          <label className="text-sm font-semibold text-sky-700 mb-2 block">Salary Range (₱):</label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="Min"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          {/* Skill Types Filter */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-sky-700 mb-2 block">Skill Types:</label>
            <div className="grid grid-cols-1 gap-2">
              {skillOptions.map(skill => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSkillTypes.includes(skill)}
                    onChange={() => handleSkillTypeChange(skill)}
                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Worker Status Section */}
          <div className="mt-6">
            {!workerVerified && !pendingWorker ? (
              <button
                onClick={() => navigate("/worker-registration")}
                className="w-full py-2 font-medium rounded bg-sky-600 text-white hover:bg-sky-500 transition"
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
                className="w-full py-2 font-medium rounded bg-sky-600 text-white hover:bg-sky-500 transition"
              >
                Create Portfolio
              </button>
            ) : (
              <div className="space-y-4">
                <div className="w-full py-2 text-center text-sky-800 rounded font-semibold border border-sky-300 bg-sky-50">
                  ✅ Verified Worker
                </div>
                <button
                  onClick={() => navigate("/jobs/job-application/pending")}
                  className="w-full py-2 bg-sky-600 text-white font-medium rounded hover:bg-sky-500 transition cursor-pointer"
                >
                  Pending Applications
                </button>
                <button
                  onClick={() => navigate("/jobs/job-application/waiting-to-confirm")}
                  className="w-full py-2 bg-sky-600 text-white font-medium rounded hover:bg-sky-500 transition cursor-pointer"
                >
                  Accepted Applications
                </button>
                <button
                  onClick={() => navigate("/jobs/job-application/ongoing-jobs")}
                  className="w-full py-2 bg-sky-600 text-white font-medium rounded hover:bg-sky-500 transition cursor-pointer"
                >
                  Ongoing Jobs
                </button>
                <button
                  onClick={() => navigate("/jobs/job-application/job-history")}
                  className="w-full py-2 bg-sky-600 text-white font-medium rounded hover:bg-sky-500 transition cursor-pointer"
                >
                  Job History
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ✅ Main Content */}
        <main className="flex-1">
          {filteredJobs.length === 0 ? (
            <div className="text-center text-gray-600 mt-10">No matching services found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-sky-300 rounded-lg shadow hover:shadow-md transition duration-200 overflow-hidden"
                >
                  <img
                    src={job.jobImage}
                    alt={job.jobName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 space-y-1">
                    <h3 className="text-lg font-bold text-sky-800">{job.jobName}</h3>
                    <p className="text-sm text-gray-700">
                      ₱{job.minSalary} – ₱{job.maxSalary} / {job.salaryFrequency}
                    </p>
                    {job.skillTypes && job.skillTypes.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Skills: </span>
                        {job.skillTypes.join(", ")}
                      </div>
                    )}
                    <p className="text-xs font-semibold">
                      Status:{" "}
                      <span className={job.isAvailable ? "text-green-700" : "text-red-700"}>
                        {job.isAvailable ? "Open" : "Closed"}
                      </span>
                    </p>
                    <button
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      className="mt-3 w-full py-2 bg-sky-600 text-white rounded hover:bg-sky-500 transition cursor-pointer"
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

      {/* ✅ Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sky-300 shadow-md z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {!workerVerified && !pendingWorker ? (
            <button
              onClick={() => navigate("/worker-registration")}
              className="w-full py-2 px-4 font-medium rounded text-center bg-sky-600 text-white hover:bg-sky-500"
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
              className="w-full py-2 px-4 font-medium rounded text-center bg-sky-600 text-white hover:bg-sky-500"
            >
              Create Portfolio
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/jobs/job-application/pending")}
                className="flex flex-col items-center text-sky-700 hover:text-sky-900"
              >
                <span className="text-xs">Pending</span>
              </button>
              <button
                onClick={() => navigate("/jobs/job-application/waiting-to-confirm")}
                className="flex flex-col items-center text-sky-700 hover:text-sky-900"
              >
                <span className="text-xs">Accepted</span>
              </button>
              <button
                onClick={() => navigate("/jobs/job-application/ongoing-jobs")}
                className="flex flex-col items-center text-sky-700 hover:text-sky-900"
              >
                <span className="text-xs">Ongoing</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Services;