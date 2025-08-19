import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    trim: true,
  },
  skillDescription: {
    type: String,
    trim: true,
  },
});

const workerPortfolioSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    workerAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerAddress",
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
    skills: {
      type: [skillSchema],
      validate: {
        validator: function (skills) {
          return Array.isArray(skills) && skills.length > 0;
        },
        message: "At least one skill is required.",
      },
    },
    portfolioStatus: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
  },
  { timestamps: true }
);

const WorkerPortfolio = mongoose.model("WorkerPortfolio", workerPortfolioSchema);
export default WorkerPortfolio;