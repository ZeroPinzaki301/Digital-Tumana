import mongoose from "mongoose";

const workerAddressSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    region: { type: String, required: true },
    province: { type: String, required: true },
    cityOrMunicipality: { type: String, required: true },
    barangay: { type: String, required: true },
    street: { type: String, required: true },
    postalCode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

const WorkerAddress = mongoose.model("WorkerAddress", workerAddressSchema);
export default WorkerAddress;