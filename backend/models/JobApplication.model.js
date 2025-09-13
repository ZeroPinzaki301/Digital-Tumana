import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    workerPortfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerPortfolio",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "workerConfirmation",
        "ongoingJob",
        "completed",
        "terminated",
        "rejected",
        "cancelled"
      ],
      default: "pending"
    },
    interviewDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;