import User from "../models/User.model.js";
import Seller from "../models/Seller.model.js";
import Worker from "../models/Worker.model.js";
import Employer from "../models/Employer.model.js";
import Customer from "../models/Customer.model.js";

export const getVerifiedUsersWithRoles = async (req, res) => {
  try {
    // Step 1: Get all verified users
    const users = await User.find({ isVerified: true }).lean();

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userId = user._id;

        // Step 2: Fetch role-specific data
        const [seller, worker, employer, customer] = await Promise.all([
          Seller.findOne({ userId, status: "verified" }).lean(),
          Worker.findOne({ userId, status: "verified" }).lean(),
          Employer.findOne({ userId, status: "verified" }).lean(),
          Customer.findOne({ userId, isVerified: true }).lean(),
        ]);

        // Step 3: Build response object
        const userData = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          agreedToPolicy: user.agreedToPolicy,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        const roleData = {};

        if (seller) {
          roleData.seller = {
            _id: seller._id,
            storeName: seller.storeName,
            storePicture: seller.storePicture,
          };
        }

        if (worker) {
          roleData.worker = {
            _id: worker._id,
            firstName: worker.firstName,
            lastName: worker.lastName,
            profilePicture: worker.profilePicture,
          };
        }

        if (employer) {
          roleData.employer = {
            _id: employer._id,
            companyName: employer.companyName,
            profilePicture: employer.profilePicture,
          };
        }

        if (customer) {
          roleData.customer = {
            _id: customer._id,
            fullName: customer.fullName,
          };
        }

        return {
          ...userData,
          roles: Object.keys(roleData).length > 0 ? roleData : "This user has not registered as worker/customer/seller/employer yet",
        };
      })
    );

    res.status(200).json(enrichedUsers);
  } catch (error) {
    console.error("Error fetching verified users:", error);
    res.status(500).json({ message: "Server error while retrieving users." });
  }
};