import Job from "../models/Job.model.js";
import Employer from "../models/Employer.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

export const createJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    const {
      jobName,
      jobDescription,
      minSalary,
      maxSalary,
      salaryFrequency,
      jobCode,
    } = req.body;

    if (!req.files?.jobImage) {
      return res.status(400).json({ message: "Main job image is required" });
    }

    const jobImageRes = await uploadToCloudinary(
      req.files.jobImage[0].path,
      "job_images"
    );

    const newJob = await Job.create({
      employerId: employer._id,
      jobName,
      jobDescription,
      minSalary,
      maxSalary,
      salaryFrequency,
      jobCode,
      jobImage: jobImageRes.secure_url,
      isAvailable: true, // Default to available on creation
    });

    res.status(201).json({ message: "Job created", job: newJob });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create job",
      error: error.message,
    });
  }
};


export const getEmployerJobs = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const jobs = await Job.find({ employerId: employer._id });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

export const getSingleJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const job = await Job.findOne({
      _id: req.params.jobId,
      employerId: employer._id,
    });

    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve job", error: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, employerId: employer._id },
      req.body,
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const job = await Job.findOne({ _id: req.params.jobId, employerId: employer._id });
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    await Job.findByIdAndDelete(job._id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};