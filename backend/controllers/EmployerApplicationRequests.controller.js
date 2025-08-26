import JobApplication from "../models/JobApplication.model.js";
import Employer from "../models/Employer.model.js";
import Worker from "../models/Worker.model.js";
import WorkerPortfolio from "../models/WorkerPortfolio.model.js";
import WorkerAddress from "../models/WorkerAddress.model.js";
import TumanaBachelor from "../models/TumanaBachelor.model.js";


export const getEmployerJobApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const employer = await Employer.findOne({ userId });
    if (!employer) {
      return res.status(403).json({ message: "User is not registered as an employer" });
    }

    const employerId = employer._id;

    const applications = await JobApplication.find({
      employerId,
      status: "pending"
    })
      .populate("jobId", "jobName jobImage jobCode minSalary maxSalary")
      .populate("applicantId", "firstName lastName profilePicture email")
      .populate("workerPortfolioId", "skillTypes portfolioStatus");

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching pending job applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getEmployerOngoingJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const employer = await Employer.findOne({ userId });
    if (!employer) {
      return res.status(403).json({ message: "User is not registered as an employer" });
    }

    const employerId = employer._id;

    const ongoingJobs = await JobApplication.find({
      employerId,
      status: "ongoingJob"
    })
      .populate("jobId", "jobName jobImage jobCode minSalary maxSalary")
      .populate("applicantId", "firstName lastName profilePicture email")
      .populate("workerPortfolioId", "skillTypes portfolioStatus");

    return res.status(200).json({ ongoingJobs });
  } catch (error) {
    console.error("Error fetching ongoing jobs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkerApplicationDetails = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId).lean();
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const portfolio = await WorkerPortfolio.findOne({ workerId }).lean();

    const address = portfolio?.workerAddress
      ? await WorkerAddress.findById(portfolio.workerAddress).lean()
      : null;

    const isTumanaBachelor = await TumanaBachelor.exists({ userId: worker.userId });

    const response = {
      worker: {
        _id: worker._id,
        firstName: worker.firstName,
        middleName: worker.middleName,
        lastName: worker.lastName,
        sex: worker.sex,
        age: worker.age,
        birthdate: worker.birthdate,
        nationality: worker.nationality,
        email: worker.email,
        profilePicture: worker.profilePicture,
        validIdImage: worker.validIdImage,
        resumeFile: worker.resumeFile,
        status: worker.status,
        userId: worker.userId,
      },
      portfolio: portfolio
        ? {
            skillTypes: portfolio.skillTypes,
            skills: portfolio.skills,
            portfolioStatus: portfolio.portfolioStatus,
          }
        : null,
      address: address
        ? {
            region: address.region,
            province: address.province,
            cityOrMunicipality: address.cityOrMunicipality,
            barangay: address.barangay,
            street: address.street,
            postalCode: address.postalCode,
            email: address.email,
            telephone: address.telephone,
          }
        : null,
      isTumanaBachelor: !!isTumanaBachelor,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching worker application details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateJobApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "workerConfirmation",
      "rejected",
      "cancelled",
      "terminated",
      "completed"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const employer = await Employer.findOne({ userId });
    if (!employer) {
      return res.status(403).json({ message: "User is not registered as an employer" });
    }

    const application = await JobApplication.findOne({
      _id: applicationId,
      employerId: employer._id
    });

    if (!application) {
      return res.status(404).json({ message: "Job application not found or unauthorized" });
    }

    const allowedTransitions = {
      pending: ["workerConfirmation", "rejected", "completed","cancelled"],
      workerConfirmation: [],
      ongoingJob: ["cancelled", "completed"],
    };

    const currentStatus = application.status;
    const allowedNext = allowedTransitions[currentStatus] || [];

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from '${currentStatus}' to '${status}'`
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      message: `Application status updated to '${status}'`,
      application
    });
  } catch (error) {
    console.error("Error updating job application status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkerJobHistoryById = async (req, res) => {
  try {
    const { workerId } = req.params;

    const applications = await JobApplication.find({
      applicantId: workerId,
      status: { $in: ["completed", "terminated"] }
    })
      .populate("jobId", "jobName jobImage jobCode minSalary maxSalary")
      .populate("employerId", "firstName lastName companyName profilePicture email status");

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching worker job history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};