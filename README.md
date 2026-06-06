# 🌾 Digital Tumana - MERN Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue)](https://reactjs.org/)

**Digital Tumana** is a comprehensive digital ecosystem designed to empower local farmers and residents of our municipality. The platform bridges the gap between agricultural producers, service providers, and the community by offering a marketplace for farm products, a job and service rendering portal, and direct enrollment to TESDA skills training programs.

## ✨ Key Features

- **🌱 Digital Marketplace:** Farmers (Sellers) can list products, manage inventory, and process orders. Customers can browse, purchase, and track their farm-fresh goods.
- **🤝 Jobs & Services Portal:** Employers can post local jobs or service requests. Workers (e.g., farmers, carpenters, technicians) can find work, apply for jobs, and manage their service portfolio.
- **🎓 TESDA Enrollment Module:** Community members can browse and enroll in local Technical Education and Skills Development Authority (TESDA) courses directly through the platform.
- **🚚 Integrated Logistics (Kariton Service):** A dedicated delivery management system ("Kariton Service") for assigning and tracking deliveries, supporting local riders.
- **🛠️ Admin Dashboard:** A powerful backend for administrators to manage all users (farmers, employers, workers, customers), approve listings, track orders, manage TESDA enrollments, and oversee seller balances/withdrawals.
- **📱 Responsive Design:** Fully functional across desktops, tablets, and mobile devices.

## 🏗️ System Architecture

The project is a full-stack MERN (MongoDB, Express.js, React, Node.js) application divided into three main components:

1.  **Backend API:** RESTful API server handling database models, business logic, authentication, and file uploads.
2.  **Frontend User Application:** React-based web app for all user types (Customers, Sellers, Employers, Workers, Kariton Riders).
3.  **Frontend Admin Panel:** React-based dashboard for platform administrators.

## 📂 Project Structure

### 🔧 Backend (`/backend`)

The core API server with a modular structure.

backend/
├── config/ # Configuration files
│ ├── cloudinary.js # Cloudinary image upload setup
│ └── db.js # MongoDB connection
├── controllers/ # Business logic for each feature (43+ controllers)
│ ├── Admin.controller.js, AdminApproval.controller.js, AdminOrderTracking.controller.js, AdminSellerBalance.controller.js, AdminTesda.controller.js, AdminUserManagement.controller.js
│ ├── Cart.controller.js, Customer.controller.js, CustomerOrder.controller.js
│ ├── Employer.controller.js, EmployerApplicationRequests.controller.js, EmployerJob.controller.js
│ ├── JobApplication.controller.js, JobsAndServices.controller.js
│ ├── KaritonRider.controller.js, KaritonService.controller.js
│ ├── Order.controller.js, OrderToDeliver.controller.js, OrderTracking.controller.js
│ ├── Product.controller.js, Seller.controller.js, SellerBalance.controller.js, SellerOrder.controller.js, SellerProduct.controller.js
│ ├── TesdaEnrollment.controller.js, TumanaBachelor.controller.js
│ ├── User.controller.js, Worker.controller.js, WorkerPortfolio.controller.js
│ └── ... (Feedback, Notification, RiderRating, RiderVehicleDetails, DefaultIdCard)
├── middlewares/ # Custom middleware functions
│ ├── authMiddleware.js, KaritonAuthMiddleware.js
│ ├── rateLimitMiddleware.js, uploadMiddleware.js
├── models/ # Mongoose data models (35+ models)
│ ├── User.model.js, Admin.model.js, Customer.model.js, Seller.model.js, Employer.model.js, Worker.model.js
│ ├── Product.model.js, Order.model.js, Cart.model.js, Job.model.js, JobApplication.model.js
│ ├── TesdaEnrollment.model.js, DeliveryCourier.model.js, KaritonService.model.js
│ ├── SellerBalance.model.js, SellerBalanceWithdrawal.model.js
│ └── ... (Feedback, OrderToDeliver, OrderTracking, RiderRating, etc.)
├── routes/ # API route definitions (mirrors controllers)
│ ├── Admin.route.js, User.route.js, Product.route.js, Order.route.js
│ └── ... (all feature-specific routes)
├── utils/ # Utility functions
│ ├── emailSender.js, emailTemplates.js
├── uploads/ # Temporary local storage for uploads
├── dbIndexes.js # Database indexing for performance
├── server.js # Main application entry point
└── package.json


### 💻 Frontend - User Application (`/frontend-users`)

The main application for all community members.

frontend-users/
├── public/
│ └── digital-tumana-icon.png
├── src/
│ ├── assets/ # Static images, fonts, etc.
│ ├── components/ # Reusable UI components
│ │ ├── Navbar.jsx, Notification.jsx
│ ├── data/
│ │ └── ph-geodata.json # Philippine geography data for forms
│ ├── pages/ # Main application views (50+ pages)
│ │ ├── auth/ # (Login, Register, ForgotPassword, VerifyEmail, ResetPassword)
│ │ ├── customer/ # (Marketplace, Cart, Order History, Checkout)
│ │ ├── seller/ # (Seller Dashboard, Products, Orders, Balance)
│ │ ├── employer/ # (Employer Dashboard, Post Jobs, Applications)
│ │ ├── worker/ # (Worker Dashboard, Find Jobs, Portfolio)
│ │ ├── kariton/ # (Rider Delivery Requests, History, Details)
│ │ └── shared/ # (Account, Learn, FeedbackForm, TesdaEnroll)
│ ├── utils/
│ │ └── axiosInstance.js # Centralized API client
│ ├── App.jsx, main.jsx
│ └── index.css, App.css
├── index.html, vite.config.js
└── package.json


### 🛡️ Frontend - Admin Panel (`/frontend-admin`)

A dedicated dashboard for platform administrators.
frontend-admin/
├── public/
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── AdminSidebar.jsx, AlertModal.jsx
│ ├── data/
│ │ └── ph-geodata.json
│ ├── pages/ # Admin management views (20+ pages)
│ │ ├── AdminDashboard.jsx, AdminLogin.jsx, AdminRegister.jsx, AdminVerify.jsx
│ │ ├── AdminUserManagement.jsx, AdminSellerRequests.jsx, AdminEmployerRequests.jsx
│ │ ├── AdminCustomerRequests.jsx, AdminWorkerRequests.jsx, AdminAffiliationRequests.jsx
│ │ ├── AdminTesdaEnrollments.jsx, AdminTesdaEnrollmentDetail.jsx
│ │ ├── AdminOngoingDeliveries.jsx, AdminShippedOrder.jsx, AdminConfirmedOrder.jsx
│ │ ├── AdminKaritonService.jsx, AdminKaritonRiderDetails.jsx
│ │ ├── AdminSellerBalances.jsx, AdminPendingWithdrawal.jsx
│ │ └── AdminFeedbackManagement.jsx
│ ├── utils/
│ │ └── axiosInstance.js
│ ├── AdminLayout.jsx, App.jsx, main.jsx
│ └── index.css, App.css
├── index.html, vite.config.js
└── package.json


## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14.x or later) and **npm** or **yarn**
- **MongoDB** (Local installation or MongoDB Atlas cloud cluster)
- **Cloudinary Account** (for image uploads)
- **Email Service credentials** (e.g., Gmail SMTP, SendGrid for email notifications)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ZeroPinzaki301/Digital-Tumana.git
    cd digital-tumana

    cd backend
    npm install
    # Create a .env file (see Environment Variables section below)
    npm run dev

    cd ../frontend-users
    npm install
    # Create a .env file (see Environment Variables section below)
    npm run dev

    cd ../frontend-admin
    npm install
    # Create a .env file (see Environment Variables section below)
    npm run dev

    # Server Configuration
    PORT=5000
    NODE_ENV=development
    
    # Database Configuration
    MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/digital_tumana?retryWrites=true&w=majority
    
    # JWT Authentication
    JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
    
    # Cloudinary Configuration (Image Upload)
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    
    # Email Configuration (SendGrid)
    SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
    VERIFIED_SENDER_EMAIL=noreply@digitaltumana.com
    
    # Legacy Email Configuration (if using SMTP fallback)
    EMAIL_USER=your_emergency_email@gmail.com
    EMAIL_PASS=your_app_specific_password
    
    # Frontend URLs for CORS and redirects
    FRONTEND_URL=http://localhost:5173 || https://digitaltumana.netlify.app/
    ADMIN_URL=http://localhost:5174 || https://tumanaadmin.netlify.app/
