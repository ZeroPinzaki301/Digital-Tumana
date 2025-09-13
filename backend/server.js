import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
import adminUserManagementRoutes from "./routes/AdminUserManagement.route.js"
import feedbackRoutes from "./routes/Feedback.route.js"
import riderVehicleDetailsRoutes from "./routes/RiderVehicleDetails.route.js";
import riderRatingRoutes from "./routes/RiderRating.route.js";
import notificationRoutes from "./routes/Notification.route.js"

// ES module equivalents of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for production and development
const allowedOrigins = [
  'https://digitaltumana.netlify.app',
  'https://tumanaadmin.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser requests

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`Blocked CORS request from: ${origin}`);
      return callback(new Error('CORS policy does not allow access from this origin.'), false);
    }
  },
  credentials: true
}));

// Connect to database
connectDB();

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/admin/user-management", adminUserManagementRoutes);
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
app.use("/api/kariton", karitonServiceRoutes);
app.use("/api/kariton/vehicle", riderVehicleDetailsRoutes);
app.use("/api/order-to-deliver/", orderToDeliverRoutes);
app.use("/api/seller-balance/", sellerBalanceRoutes);
app.use("/api/admin/seller-balance", adminSellerBalanceRoutes);
app.use("/api/tesda/", tesdaEnrollmentRoutes );
app.use("/api/admin/tesda/", adminTesdaRoutes );
app.use("/api/employer/jobs", employerJobRoutes);
app.use("/api/jobs", jobsAndServicesRoutes);
app.use("/api/worker/portfolio", workerPortfolioRoutes);
app.use("/api/job-applications", jobApplicationRoutes)
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/rider/rating", riderRatingRoutes);

app.use("/api/notification", notificationRoutes);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production (if needed)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle SPA routing in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? {} : err 
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
