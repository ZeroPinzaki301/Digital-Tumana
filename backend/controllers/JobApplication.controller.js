import JobApplication from "../models/JobApplication.model.js";
import Job from "../models/Job.model.js";
import Worker from "../models/Worker.model.js";
import Employer from "../models/Employer.model.js";
import EmployerAddress from "../models/EmployerAddress.model.js";
import WorkerPortfolio from "../models/WorkerPortfolio.model.js";

export const createJobApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const employerId = job.employerId;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }
    const applicantId = worker._id;

    const portfolio = await WorkerPortfolio.findOne({ workerId: applicantId });
    if (!portfolio) {
      return res.status(404).json({ message: "Worker portfolio not found" });
    }

    const application = await JobApplication.create({
      jobId,
      employerId,
      applicantId,
      workerPortfolioId: portfolio._id,
      status: "pending",
    });

    return res.status(201).json({
      message: "Job application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Error creating job application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkExisting = async (req, res) => {
  try {
    const userId = req.user.id;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const applicantId = worker._id;

    const applications = await JobApplication.find({ applicantId }).select("jobId");

    const appliedJobIds = applications.map(app => app.jobId.toString());

    return res.status(200).json({ appliedJobIds });
  } catch (error) {
    console.error("Error checking existing applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// New controller function to get application details
export const checkApplicationDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.query;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const applicantId = worker._id;

    // Find application for this specific job
    const application = await JobApplication.findOne({ 
      applicantId, 
      jobId 
    });

    return res.status(200).json({ application });
  } catch (error) {
    console.error("Error checking application details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const applicantId = worker._id;

    const pendingApplications = await JobApplication.find({
      applicantId,
      status: "pending",
    })
      .populate("jobId", "jobName jobImage jobCode minSalary maxSalary")
      .populate("employerId", "companyName")
      .populate("workerPortfolioId", "portfolioStatus");

    return res.status(200).json({ pendingApplications });
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkerConfirmationApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const workerId = worker._id;
    const applications = await JobApplication.find({
      applicantId: workerId,
      status: "workerConfirmation"
    })
      .populate("jobId", "jobName jobImage jobCode minSalary maxSalary")
      .populate("employerId", "firstName lastName companyName profilePicture email status");

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching worker confirmation applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkerOngoingJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const workerId = worker._id;

    const applications = await JobApplication.find({
      applicantId: workerId,
      status: "ongoingJob"
    })
      .populate("jobId", "jobName jobImage jobCode minSalary maxSalary")
      .populate("employerId", "firstName lastName companyName profilePicture email status");

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching ongoing job applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOngoingJobDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findById(applicationId)
      .populate({
        path: "jobId",
        model: "Job",
      })
      .populate({
        path: "employerId",
        model: "Employer",
        populate: {
          path: "employerAddress",
          model: "EmployerAddress",
        },
      });

    if (!application) {
      return res.status(404).json({ message: "Job application not found" });
    }

    return res.status(200).json({ application });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const confirmJobApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { status } = req.body;

    if (status !== "ongoingJob") {
      return res.status(400).json({
        message: "Invalid status. Workers can only confirm to 'ongoingJob'."
      });
    }

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicantId: worker._id
    });

    if (!application) {
      return res.status(404).json({ message: "Job application not found or unauthorized" });
    }

    if (application.status !== "workerConfirmation") {
      return res.status(400).json({
        message: `Cannot confirm job. Current status is '${application.status}', expected 'workerConfirmation'.`
      });
    }

    application.status = "ongoingJob";
    await application.save();

    return res.status(200).json({
      message: "Job application confirmed. Status updated to 'ongoingJob'.",
      application
    });
  } catch (error) {
    console.error("Error confirming job application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const terminateApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const applicantId = worker._id;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicantId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    application.status = "terminated";
    await application.save();

    return res.status(200).json({ message: "Application terminated successfully", application });
  } catch (error) {
    console.error("Error terminating application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const applicantId = worker._id;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicantId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }
    
    application.status = "cancelled";
    await application.save();

    return res.status(200).json({ message: "Application cancelled successfully", application });
  } catch (error) {
    console.error("Error cancelling application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getJobHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(403).json({ message: "User is not registered as a worker" });
    }

    const workerId = worker._id;

    const applications = await JobApplication.find({
      applicantId: workerId,
      status: { $in: ["completed", "terminated"] }
    })
      .populate("jobId", "jobName jobImage jobCode minSalary maxSalary")
      .populate("employerId", "firstName lastName companyName profilePicture email status");

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching job history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

