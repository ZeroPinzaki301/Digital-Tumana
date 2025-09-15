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

import { notificationLimiter, notificationCountLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Lightweight endpoints for notification status (recommended for navbar)
router.get('/count', protect, notificationCountLimiter, getNotificationCount);
router.get('/job-application-count', protect, notificationCountLimiter, getJobApplicationNotificationCount);
router.get('/worker-job-application-count', notificationCountLimiter, protect, getWorkerJobApplicationNotificationCount);
router.get('/out-for-delivery-count', notificationCountLimiter, protect, getOutForDeliveryOrderCount);

// Full notification data endpoints
router.get('/tesda', protect, notificationLimiter, getTesdaNotifications);
router.get('/order', protect, notificationLimiter, getOrderNotifications);
router.get('/job-applications', protect, notificationLimiter, getJobApplicationNotifications);
router.get('/worker-job-applications', protect, notificationLimiter, getWorkerJobApplicationNotifications);
router.get('/out-for-delivery', protect, notificationLimiter, getOutForDeliveryOrders);

export default router;