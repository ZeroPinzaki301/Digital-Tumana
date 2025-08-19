// karitonAuthMiddleware.js
import jwt from "jsonwebtoken";
import KaritonService from "../models/KaritonService.model.js";

export const protectRider = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const rider = await KaritonService.findById(decoded.riderId);
    if (!rider) return res.status(404).json({ message: "Kariton Rider not found" });

    req.user = { riderId: rider._id, email: rider.email, fullName: `${rider.firstName} ${rider.lastName}` };
    next();
  } catch (err) {
    console.error("[Kariton Auth Error]", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};