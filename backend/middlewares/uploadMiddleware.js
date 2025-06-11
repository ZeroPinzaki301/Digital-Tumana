import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req) => req.body.folder || "general-uploads", // Default folder
    format: async (req, file) => {
      const allowedFormats = ["jpeg", "png", "jpg", "webp"];
      const fileFormat = file.mimetype.split("/")[1]; // Extract format from MIME type
      return allowedFormats.includes(fileFormat) ? fileFormat : "jpeg"; // Default to JPEG if unsupported
    },
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
  },
});

export const upload = multer({ storage });