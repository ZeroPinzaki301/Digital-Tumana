import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; 
import userRoutes from "./routes/User.route.js";
import adminRoutes from "./routes/Admin.route.js"
import sellerRoutes from "./routes/Seller.route.js"
import workerRoutes from "./routes/Worker.route.js"
import employerRoutes from "./routes/Employer.route.js"
import adminApprovalRoutes from "./routes/AdminApproval.route.js"
import sellerProductRoutes from "./routes/SellerProduct.route.js"
import productRoutes from "./routes/Product.route.js"


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to database
connectDB();

app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/sellers", sellerRoutes)
app.use("/api/workers", workerRoutes)
app.use("/api/employers", employerRoutes)
app.use("/api/admin-approval", adminApprovalRoutes)
app.use("/api/products", sellerProductRoutes)
app.use("/api/products", productRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));