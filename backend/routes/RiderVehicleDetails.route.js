import express from "express";
import {
  createRiderVehicleDetails,
  getAllRiderVehicleDetails,
  getRiderVehicleDetailsById,
  updateRiderVehicleDetails,
  deleteRiderVehicleDetails,
  getRiderVehicleDetailsByRiderId,
  deleteVehicleFromRider // Add this import
} from "../controllers/RiderVehicleDetails.controller.js";

import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  '/',
  upload.fields([
    { name: 'plateNumberImage', maxCount: 1 },
    { name: 'vehicleImages', maxCount: 10 }
  ]),
  createRiderVehicleDetails
);
router.get("/", getAllRiderVehicleDetails);
router.get("/rider/:riderId", getRiderVehicleDetailsByRiderId);
router.get("/:id", getRiderVehicleDetailsById);
router.put("/:id", updateRiderVehicleDetails);
router.delete("/:vehicleId", deleteVehicleFromRider); // New route for deleting a vehicle
router.delete("/:id", deleteRiderVehicleDetails); // Keep this if you need to delete entire documents

export default router;