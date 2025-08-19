import express, { application } from "express";
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
import customerRoutes from "./routes/Customer.route.js"
import orderRoutes from "./routes/Order.route.js"
import cartRoutes from "./routes/Cart.route.js"
import orderTrackingRoutes from "./routes/OrderTracking.route.js"
import adminOrderTrackingRoutes from "./routes/AdminOrderTracking.route.js"
import karitonServiceRoutes from "./routes/KaritonService.route.js"
import orderToDeliverRoutes from "./routes/OrderToDeliver.route.js"
import sellerBalanceRoutes from "./routes/SellerBalance.route.js"
import adminSellerBalanceRoutes from "./routes/AdminSellerBalance.route.js"
import customerOrderRoutes from "./routes/CustomerOrder.route.js"
import tesdaEnrollmentRoutes from "./routes/TesdaEnrollment.route.js"
import adminTesdaRoutes from "./routes/AdminTesda.route.js"
import employerJobRoutes from "./routes/EmployerJob.route.js"
import jobsAndServicesRoutes from "./routes/JobsAndServices.route.js"
import workerPortfolioRoutes from "./routes/WorkerPortfolio.route.js"
import jobApplicationRoutes from "./routes/JobApplication.route.js"

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
app.use("/api/workers", workerRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/admin-approval", adminApprovalRoutes);
app.use("/api/products", sellerProductRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customer/order", customerOrderRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/order-tracking", orderTrackingRoutes);
app.use("/api/order-tracking/admin", adminOrderTrackingRoutes);
app.use("/api/kariton/", karitonServiceRoutes);
app.use("/api/order-to-deliver/", orderToDeliverRoutes);
app.use("/api/seller-balance/", sellerBalanceRoutes);
app.use("/api/admin/seller-balance", adminSellerBalanceRoutes);
app.use("/api/tesda/", tesdaEnrollmentRoutes );
app.use("/api/admin/tesda/", adminTesdaRoutes );
app.use("/api/employer/jobs", employerJobRoutes);
app.use("/api/jobs", jobsAndServicesRoutes);
app.use("/api/worker/portfolio", workerPortfolioRoutes);
app.use("/api/job-applications", jobApplicationRoutes)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));