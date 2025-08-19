import express from "express";
import { 
  getAllJobs,
  getJobById
 } from "../controllers/JobsAndServices.controller.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/:jobId", getJobById);


export default router;