import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  createWorkerPortfolio,
  getWorkerPortfolio,
  updateWorkerPortfolio,
  deleteWorkerPortfolio,
  getWorkerPortfolioStatus,
  updatePortfolioStatus
} from "../controllers/WorkerPortfolio.controller.js";

const router = express.Router();

router.post("/", protect, createWorkerPortfolio);
router.get("/", protect, getWorkerPortfolio);
router.get("/status", protect, getWorkerPortfolioStatus);
router.patch("/status", protect, updatePortfolioStatus);
router.put("/", protect, updateWorkerPortfolio);
router.delete("/", protect, deleteWorkerPortfolio);

export default router;