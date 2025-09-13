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
      skillTypes,
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
      skillTypes: skillTypes || [], 
      jobImage: jobImageRes.secure_url,
      isAvailable: true, 
    });

    res.status(201).json({ message: "Job created", job: newJob });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create job",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer || job.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    // Parse skillTypes if it's a JSON string
    let updates = { ...req.body };
    if (typeof updates.skillTypes === 'string') {
      try {
        updates.skillTypes = JSON.parse(updates.skillTypes);
      } catch (e) {
        delete updates.skillTypes;
      }
    }

    // Handle image update if provided
    if (req.files?.jobImage) {
      const jobImageRes = await uploadToCloudinary(
        req.files.jobImage[0].path,
        "job_images"
      );
      updates.jobImage = jobImageRes.secure_url;
    }

    // Use Object.assign like your product controller
    Object.assign(job, updates);
    await job.save();

    res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// Other controller functions remain the same...
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

export const deleteJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const job = await Job.findOne({ _id: req.params.jobId, employerId: employer._id });
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    // Delete image from Cloudinary if it exists
    if (job.jobImage) {
      try {
        const publicId = job.jobImage.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`job_images/${publicId}`);
      } catch (error) {
        console.error("Error deleting image:", error);
        // Continue with deletion even if image deletion fails
      }
    }

    await Job.findByIdAndDelete(job._id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};