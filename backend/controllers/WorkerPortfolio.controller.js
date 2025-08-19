import mongoose from "mongoose";
import Worker from "../models/Worker.model.js";
import WorkerPortfolio from "../models/WorkerPortfolio.model.js";

export const createWorkerPortfolio = async (req, res) => {
  try {
    const { skillTypes, skills, workerAddress } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found." });
    }

    const existingPortfolio = await WorkerPortfolio.findOne({ workerId: worker._id });
    if (existingPortfolio) {
      return res.status(400).json({ message: "Portfolio already exists." });
    }

    if (!Array.isArray(skills) || skills.length === 0 || skills.some(s => !s.skillName?.trim())) {
      return res.status(400).json({ message: "Invalid skills: Each skill must have a name." });
    }

    const allowedTypes = [
      "Plants", "Fertilizers", "Animals", "Machinery",
      "Irrigation", "Harvesting", "Storage", "Other"
    ];
    const invalidTypes = skillTypes.filter(type => !allowedTypes.includes(type));
    if (invalidTypes.length > 0) {
      return res.status(400).json({ message: `Invalid skillTypes: ${invalidTypes.join(", ")}` });
    }

    const portfolio = new WorkerPortfolio({
      workerId: worker._id,
      workerAddress: new mongoose.Types.ObjectId(workerAddress),
      skillTypes,
      skills,
    });

    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (error) {
    console.error("Portfolio creation error:", error);
    res.status(500).json({ message: "Error creating portfolio", error: error.message });
  }
};

export const getWorkerPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;
    const worker = await Worker.findOne({ userId });
    if (!worker) return res.status(404).json({ message: "Worker not found." });

    const portfolio = await WorkerPortfolio.findOne({ workerId: worker._id })
      .populate("workerAddress")
      .populate("workerId");

    if (!portfolio) return res.status(404).json({ message: "Portfolio not found." });

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolio", error });
  }
};

export const updateWorkerPortfolio = async (req, res) => {
  try {
    const { skillTypes, skills, workerAddress, portfolioStatus } = req.body;
    const userId = req.user._id;

    const worker = await Worker.findOne({ userId });
    if (!worker) return res.status(404).json({ message: "Worker not found." });

    const portfolio = await WorkerPortfolio.findOneAndUpdate(
      { workerId: worker._id },
      {
        $set: {
          skillTypes,
          skills,
          workerAddress,
          portfolioStatus,
        },
      },
      { new: true }
    );

    if (!portfolio) return res.status(404).json({ message: "Portfolio not found." });

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error updating portfolio", error });
  }
};

export const updatePortfolioStatus = async (req, res) => {
  try {
    const { portfolioStatus } = req.body;
    const userId = req.user._id;

    if (!["available", "unavailable"].includes(portfolioStatus)) {
      return res.status(400).json({ message: "Invalid portfolioStatus value." });
    }

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found." });
    }

    const portfolio = await WorkerPortfolio.findOneAndUpdate(
      { workerId: worker._id },
      { $set: { portfolioStatus } },
      { new: true }
    );

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found." });
    }

    res.status(200).json({
      message: "Portfolio status updated successfully.",
      portfolioStatus: portfolio.portfolioStatus,
    });
  } catch (error) {
    console.error("Error updating portfolio status:", error);
    res.status(500).json({ message: "Error updating portfolio status", error: error.message });
  }
};

export const deleteWorkerPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;
    const worker = await Worker.findOne({ userId });
    if (!worker) return res.status(404).json({ message: "Worker not found." });

    const deleted = await WorkerPortfolio.findOneAndDelete({ workerId: worker._id });
    if (!deleted) return res.status(404).json({ message: "Portfolio not found." });

    res.status(200).json({ message: "Portfolio deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting portfolio", error });
  }
};

export const getWorkerPortfolioStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const worker = await Worker.findOne({ userId });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found." });
    }

    const portfolio = await WorkerPortfolio.findOne({ workerId: worker._id }).select("portfolioStatus");

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found." });
    }

    res.status(200).json({ portfolioStatus: portfolio.portfolioStatus });
  } catch (error) {
    console.error("Error fetching portfolio status:", error);
    res.status(500).json({ message: "Error fetching portfolio status", error: error.message });
  }
};
