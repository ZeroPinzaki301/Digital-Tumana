import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ["2 wheels", "3 wheels", "4 wheels", "other"],
    required: true
  },
  vehicleImages: {
    type: [String], // Array of image URLs or filenames
    default: []
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true
  },
  plateNumberImage: {
    type: String // Single image URL or filename
  }
});

const riderVehicleDetailsSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KaritonService",
    required: true
  },
  vehicles: {
    type: [vehicleSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RiderVehicleDetails =
  mongoose.models.RiderVehicleDetails ||
  mongoose.model("RiderVehicleDetails", riderVehicleDetailsSchema);

export default RiderVehicleDetails;