import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    jobName: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    minSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    maxSalary: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value >= this.minSalary;
        },
        message: "maxSalary must be greater than or equal to minSalary",
      },
    },
    salaryFrequency: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly"],
      required: true,
    },
    skillTypes: {
      type: [String],
      enum: [
        "Plants",
        "Fertilizers",
        "Animals",
        "Machinery",
        "Irrigation",
        "Harvesting",
        "Storage",
        "Other",
      ],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    jobImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;