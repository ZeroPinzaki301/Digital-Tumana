import express from 'express';
import { 
  getTesdaNotifications,
  getOrderNotifications,
  getJobApplicationNotifications,
  getWorkerJobApplicationNotifications,
  getOutForDeliveryOrders,
  getNotificationCount,
  getJobApplicationNotificationCount,
  getWorkerJobApplicationNotificationCount,
  getOutForDeliveryOrderCount
} from '../controllers/Notification.controller.js';
import protect from '../middlewares/authMiddleware.js'

const router = express.Router();

// Lightweight endpoints for notification status (recommended for navbar)
router.get('/count', protect, getNotificationCount);
router.get('/job-application-count', protect, getJobApplicationNotificationCount);
router.get('/worker-job-application-count', protect, getWorkerJobApplicationNotificationCount);
router.get('/out-for-delivery-count', protect, getOutForDeliveryOrderCount);

// Full notification data endpoints
router.get('/tesda', protect, getTesdaNotifications);
router.get('/order', protect, getOrderNotifications);
router.get('/job-applications', protect, getJobApplicationNotifications);
router.get('/worker-job-applications', protect, getWorkerJobApplicationNotifications);
router.get('/out-for-delivery', protect, getOutForDeliveryOrders);

export default router;