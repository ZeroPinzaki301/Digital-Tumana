import RiderVehicleDetails from "../models/RiderVehicleDetails.model.js";
import KaritonService from "../models/KaritonService.model.js"; // assuming this is your rider model
import { uploadToCloudinary } from  '../config/cloudinary.js';

// ✅ Create vehicle details for a rider (with file uploads)
export const createRiderVehicleDetails = async (req, res) => {
  try {
    const { riderId, vehicleName, vehicleType, plateNumber } = req.body;
    
    console.log('Received data:', { riderId, vehicleName, vehicleType, plateNumber });
    console.log('Files received:', req.files);

    // Check if riderId is provided
    if (!riderId) {
      return res.status(400).json({ message: "riderId is required" });
    }

    // Validate rider existence
    const riderExists = await KaritonService.findById(riderId);
    if (!riderExists) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Upload plate number image to Cloudinary if exists
    let plateNumberImageUrl = null;
    if (req.files?.plateNumberImage) {
      const plateNumberImage = req.files.plateNumberImage[0];
      const cloudinaryResult = await uploadToCloudinary(plateNumberImage.path, "vehicle_plates");
      plateNumberImageUrl = cloudinaryResult.secure_url;
    }

    // Upload vehicle images to Cloudinary
    const vehicleImageUrls = [];
    if (req.files?.vehicleImages) {
      for (const image of req.files.vehicleImages) {
        const cloudinaryResult = await uploadToCloudinary(image.path, "vehicle_images");
        vehicleImageUrls.push(cloudinaryResult.secure_url);
      }
    }

    // Create vehicle details
    const newDetails = await RiderVehicleDetails.create({
      riderId,
      vehicles: [{
        vehicleName,
        vehicleType,
        plateNumber,
        plateNumberImage: plateNumberImageUrl,
        vehicleImages: vehicleImageUrls
      }]
    });

    res.status(201).json(newDetails);
  } catch (error) {
    console.error('Error creating vehicle details:', error);
    res.status(500).json({ message: "Error creating vehicle details", error: error.message });
  }
};

// 📥 Get all vehicle details (admin view) or filter by riderId
export const getAllRiderVehicleDetails = async (req, res) => {
  try {
    const { riderId } = req.query;
    let query = {};
    
    if (riderId) {
      query.riderId = riderId;
    }
    
    const details = await RiderVehicleDetails.find(query).populate("riderId");
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicle details", error });
  }
};

// 🔍 Get details for a specific rider
export const getRiderVehicleDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await RiderVehicleDetails.findById(id).populate("riderId");

    if (!details) {
      return res.status(404).json({ message: "Vehicle details not found" });
    }

    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ message: "Error fetching details", error });
  }
};

// 🔍 Get ALL vehicle details by riderId (returns array of all vehicle documents)
export const getRiderVehicleDetailsByRiderId = async (req, res) => {
  try {
    const { riderId } = req.params;
    
    // Validate rider existence
    const riderExists = await KaritonService.findById(riderId);
    if (!riderExists) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Find ALL vehicle details for this rider (using find instead of findOne)
    const vehicleDetails = await RiderVehicleDetails.find({ riderId }).populate("riderId");

    if (!vehicleDetails || vehicleDetails.length === 0) {
      return res.status(404).json({ message: "No vehicle details found for this rider" });
    }

    res.status(200).json(vehicleDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicle details", error });
  }
};

// ✏️ Update vehicle details
export const updateRiderVehicleDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedDetails = await RiderVehicleDetails.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedDetails) {
      return res.status(404).json({ message: "Vehicle details not found" });
    }

    res.status(200).json(updatedDetails);
  } catch (error) {
    res.status(500).json({ message: "Error updating details", error });
  }
};

// 🗑 Delete a specific vehicle from a rider's vehicle details
export const deleteVehicleFromRider = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    // Find the document that contains this vehicle and remove the vehicle from the array
    const updatedDetails = await RiderVehicleDetails.findOneAndUpdate(
      { "vehicles._id": vehicleId },
      { $pull: { vehicles: { _id: vehicleId } } },
      { new: true }
    );

    if (!updatedDetails) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ 
      message: "Vehicle deleted successfully",
      data: updatedDetails 
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vehicle", error });
  }
};

// 🗑 Delete entire vehicle details document (if needed)
export const deleteRiderVehicleDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RiderVehicleDetails.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Vehicle details not found" });
    }

    res.status(200).json({ message: "Vehicle details deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting details", error });
  }
};