import Job from "../models/Job.model.js";

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ message: "Failed to retrieve jobs." });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error("Error fetching job:", error.message);
    res.status(500).json({ message: "Failed to retrieve job.", error: error.message });
  }
};