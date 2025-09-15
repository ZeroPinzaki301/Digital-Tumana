import TesdaEnrollment from '../models/TesdaEnrollment.model.js';
import Order from '../models/Order.model.js';
import Seller from '../models/Seller.model.js';
import JobApplication from '../models/JobApplication.model.js';
import Employer from '../models/Employer.model.js';
import Worker from '../models/Worker.model.js';
import Customer from '../models/Customer.model.js';
import { LRUCache } from 'lru-cache';

// FIXED: Use LRU cache instead of Map to prevent memory leaks
const notificationCache = new LRUCache({
  max: 1000, // Maximum number of items
  maxAge: 2 * 60 * 1000, // 2 minutes
  updateAgeOnGet: true // Refresh age when accessed
});

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Helper function to get cache key
const getCacheKey = (userId, type) => `${userId}_${type}`;

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
};

// Get TESDA notifications
export const getTesdaNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(userId, 'tesda');
    const cachedData = notificationCache.get(cacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedData)) {
      return res.status(200).json({
        success: true,
        count: cachedData.data.length,
        data: cachedData.data,
        cached: true
      });
    }

    // Query database with optimized indexes
    const enrollments = await TesdaEnrollment.find({
      userId,
      status: { $in: ['eligible', 'reserved', 'enrolled'] }
    })
    .select('firstName middleName lastName status updatedAt')
    .sort({ updatedAt: -1 })
    .limit(10) // Limit to recent notifications
    .lean(); // Use lean() for better performance

    // Cache the results - FIXED: Use LRU set method
    notificationCache.set(cacheKey, {
      data: enrollments,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });

  } catch (error) {
    console.error('Error fetching TESDA notifications:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching TESDA notifications'
    });
  }
};

// Get order notifications for sellers
export const getOrderNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(userId, 'orders');
    const cachedData = notificationCache.get(cacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedData)) {
      return res.status(200).json({
        success: true,
        count: cachedData.data.length,
        data: cachedData.data,
        cached: true
      });
    }

    // Check if user is a seller with caching
    const sellerCacheKey = getCacheKey(userId, 'seller');
    const cachedSeller = notificationCache.get(sellerCacheKey); // FIXED: Use LRU get method
    
    let seller;
    if (isCacheValid(cachedSeller)) {
      seller = cachedSeller.data;
    } else {
      seller = await Seller.findOne({ userId }).lean();
      // FIXED: Use LRU set method
      notificationCache.set(sellerCacheKey, {
        data: seller,
        timestamp: Date.now()
      });
    }
    
    if (!seller) {
      const emptyResult = {
        success: true,
        count: 0,
        data: [],
        message: 'User is not a seller'
      };
      
      // Cache empty result too - FIXED: Use LRU set method
      notificationCache.set(cacheKey, {
        data: [],
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyResult);
    }

    // Fetch pending orders for this seller with optimizations
    const orders = await Order.find({
      sellerId: seller._id,
      status: 'pending'
    })
    .populate('buyerId', 'firstName lastName', null, { lean: true })
    .populate('items.productId', 'name', null, { lean: true })
    .select('buyerId items totalPrice status createdAt')
    .sort({ createdAt: -1 })
    .limit(10) // Limit to recent notifications
    .lean();

    // Cache the results - FIXED: Use LRU set method
    notificationCache.set(cacheKey, {
      data: orders,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching order notifications:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order notifications'
    });
  }
};

// Get job application notifications for employers
export const getJobApplicationNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(userId, 'jobApplications');
    const cachedData = notificationCache.get(cacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedData)) {
      return res.status(200).json({
        success: true,
        count: cachedData.data.length,
        data: cachedData.data,
        cached: true
      });
    }

    // Check if user is an employer with caching
    const employerCacheKey = getCacheKey(userId, 'employer');
    const cachedEmployer = notificationCache.get(employerCacheKey); // FIXED: Use LRU get method
    
    let employer;
    if (isCacheValid(cachedEmployer)) {
      employer = cachedEmployer.data;
    } else {
      employer = await Employer.findOne({ userId }).lean();
      // FIXED: Use LRU set method
      notificationCache.set(employerCacheKey, {
        data: employer,
        timestamp: Date.now()
      });
    }
    
    if (!employer) {
      const emptyResult = {
        success: true,
        count: 0,
        data: [],
        message: 'User is not an employer'
      };
      
      // Cache empty result too - FIXED: Use LRU set method
      notificationCache.set(cacheKey, {
        data: [],
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyResult);
    }

    // Fetch job applications for this employer with optimizations
    const jobApplications = await JobApplication.find({
      employerId: employer._id,
      status: { $in: ['pending', 'workerConfirmation'] }
    })
    .populate('applicantId', 'firstName lastName', null, { lean: true })
    .populate('jobId', 'title', null, { lean: true })
    .populate('workerPortfolioId', 'skills', null, { lean: true })
    .select('applicantId jobId workerPortfolioId status interviewDate createdAt')
    .sort({ createdAt: -1 })
    .limit(10) // Limit to recent notifications
    .lean();

    // Process the data to include interviewDate only for workerConfirmation status
    const processedApplications = jobApplications.map(app => {
      const application = { ...app };
      
      // Only include interviewDate if status is workerConfirmation
      if (application.status !== 'workerConfirmation') {
        delete application.interviewDate;
      }
      
      return application;
    });

    // Cache the results - FIXED: Use LRU set method
    notificationCache.set(cacheKey, {
      data: processedApplications,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      count: processedApplications.length,
      data: processedApplications
    });

  } catch (error) {
    console.error('Error fetching job application notifications:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching job application notifications'
    });
  }
};

// Get worker job application notifications (for workerConfirmation status)
export const getWorkerJobApplicationNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(userId, 'workerJobApplications');
    const cachedData = notificationCache.get(cacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedData)) {
      return res.status(200).json({
        success: true,
        count: cachedData.data.length,
        data: cachedData.data,
        cached: true
      });
    }

    // Check if user is a worker with caching
    const workerCacheKey = getCacheKey(userId, 'worker');
    const cachedWorker = notificationCache.get(workerCacheKey); // FIXED: Use LRU get method
    
    let worker;
    if (isCacheValid(cachedWorker)) {
      worker = cachedWorker.data;
    } else {
      worker = await Worker.findOne({ userId }).lean();
      // FIXED: Use LRU set method
      notificationCache.set(workerCacheKey, {
        data: worker,
        timestamp: Date.now()
      });
    }
    
    if (!worker) {
      const emptyResult = {
        success: true,
        count: 0,
        data: [],
        message: 'User is not a worker'
      };
      
      // Cache empty result too - FIXED: Use LRU set method
      notificationCache.set(cacheKey, {
        data: [],
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyResult);
    }

    // Fetch job applications for this worker with workerConfirmation status
    const jobApplications = await JobApplication.find({
      applicantId: worker._id,
      status: 'workerConfirmation'
    })
    .populate('employerId', 'firstName lastName companyName', null, { lean: true })
    .populate('jobId', 'title', null, { lean: true })
    .select('employerId jobId status interviewDate createdAt')
    .sort({ createdAt: -1 })
    .limit(10) // Limit to recent notifications
    .lean();

    // Cache the results - FIXED: Use LRU set method
    notificationCache.set(cacheKey, {
      data: jobApplications,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      count: jobApplications.length,
      data: jobApplications
    });

  } catch (error) {
    console.error('Error fetching worker job application notifications:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching worker job application notifications'
    });
  }
};

// Get all orders with "out for delivery" status for the logged-in customer
export const getOutForDeliveryOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find the customer associated with the user
    const customer = await Customer.findOne({ userId }).lean();
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(userId, 'outForDeliveryOrders');
    const cachedData = notificationCache.get(cacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedData)) {
      return res.status(200).json({
        success: true,
        count: cachedData.data.length,
        data: cachedData.data,
        cached: true
      });
    }

    // Fetch orders with "out for delivery" status for this customer
    const orders = await Order.find({
      buyerId: customer._id,
      status: 'out for delivery'
    })
    .populate('sellerId', 'businessName', null, { lean: true })
    .populate('items.productId', 'name images', null, { lean: true })
    .select('items totalPrice deliveryAddress sellerAddress status createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

    // Cache the results - FIXED: Use LRU set method
    notificationCache.set(cacheKey, {
      data: orders,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching out for delivery orders:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching out for delivery orders'
    });
  }
};

// New lightweight endpoint to check if user has notifications (count only)
export const getNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const countCacheKey = getCacheKey(userId, 'count');
    const cachedCount = notificationCache.get(countCacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedCount)) {
      return res.status(200).json({
        success: true,
        hasNotifications: cachedCount.data > 0,
        count: cachedCount.data,
        cached: true
      });
    }

    // Run count queries in parallel for better performance
    const [tesdaCount, sellerData, employerData, workerData, customerData] = await Promise.all([
      TesdaEnrollment.countDocuments({
        userId,
        status: { $in: ['eligible', 'reserved', 'enrolled'] }
      }),
      Seller.findOne({ userId }).lean(),
      Employer.findOne({ userId }).lean(),
      Worker.findOne({ userId }).lean(),
      Customer.findOne({ userId }).lean()
    ]);

    let orderCount = 0;
    if (sellerData) {
      orderCount = await Order.countDocuments({
        sellerId: sellerData._id,
        status: 'pending'
      });
    }

    let jobApplicationCount = 0;
    if (employerData) {
      jobApplicationCount = await JobApplication.countDocuments({
        employerId: employerData._id,
        status: { $in: ['pending', 'workerConfirmation'] }
      });
    }

    let workerJobApplicationCount = 0;
    if (workerData) {
      workerJobApplicationCount = await JobApplication.countDocuments({
        applicantId: workerData._id,
        status: 'workerConfirmation'
      });
    }

    let outForDeliveryCount = 0;
    if (customerData) {
      outForDeliveryCount = await Order.countDocuments({
        buyerId: customerData._id,
        status: 'out for delivery'
      });
    }

    const totalCount = tesdaCount + orderCount + jobApplicationCount + workerJobApplicationCount + outForDeliveryCount;

    // Cache the count - FIXED: Use LRU set method
    notificationCache.set(countCacheKey, {
      data: totalCount,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      hasNotifications: totalCount > 0,
      count: totalCount
    });

  } catch (error) {
    console.error('Error fetching notification count:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching notification count'
    });
  }
};

// New lightweight endpoint to check if employer has job application notifications
export const getJobApplicationNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const countCacheKey = getCacheKey(userId, 'jobApplicationCount');
    const cachedCount = notificationCache.get(countCacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedCount)) {
      return res.status(200).json({
        success: true,
        hasNotifications: cachedCount.data > 0,
        count: cachedCount.data,
        cached: true
      });
    }

    // Check if user is an employer
    const employer = await Employer.findOne({ userId }).lean();
    
    if (!employer) {
      const emptyResult = {
        success: true,
        hasNotifications: false,
        count: 0,
        message: 'User is not an employer'
      };
      
      // Cache empty result too - FIXED: Use LRU set method
      notificationCache.set(countCacheKey, {
        data: 0,
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyResult);
    }

    // Count job applications for this employer
    const jobApplicationCount = await JobApplication.countDocuments({
      employerId: employer._id,
      status: { $in: ['pending', 'workerConfirmation'] }
    });

    // Cache the count - FIXED: Use LRU set method
    notificationCache.set(countCacheKey, {
      data: jobApplicationCount,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      hasNotifications: jobApplicationCount > 0,
      count: jobApplicationCount
    });

  } catch (error) {
    console.error('Error fetching job application notification count:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching job application notification count'
    });
  }
};

// New lightweight endpoint to check if worker has job application notifications
export const getWorkerJobApplicationNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const countCacheKey = getCacheKey(userId, 'workerJobApplicationCount');
    const cachedCount = notificationCache.get(countCacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedCount)) {
      return res.status(200).json({
        success: true,
        hasNotifications: cachedCount.data > 0,
        count: cachedCount.data,
        cached: true
      });
    }

    // Check if user is a worker
    const worker = await Worker.findOne({ userId }).lean();
    
    if (!worker) {
      const emptyResult = {
        success: true,
        hasNotifications: false,
        count: 0,
        message: 'User is not a worker'
      };
      
      // Cache empty result too - FIXED: Use LRU set method
      notificationCache.set(countCacheKey, {
        data: 0,
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyResult);
    }

    // Count job applications for this worker with workerConfirmation status
    const jobApplicationCount = await JobApplication.countDocuments({
      applicantId: worker._id,
      status: 'workerConfirmation'
    });

    // Cache the count - FIXED: Use LRU set method
    notificationCache.set(countCacheKey, {
      data: jobApplicationCount,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      hasNotifications: jobApplicationCount > 0,
      count: jobApplicationCount
    });

  } catch (error) {
    console.error('Error fetching worker job application notification count:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching worker job application notification count'
    });
  }
};

// Get count of out for delivery orders for notification badge
export const getOutForDeliveryOrderCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check cache first
    const countCacheKey = getCacheKey(userId, 'outForDeliveryCount');
    const cachedCount = notificationCache.get(countCacheKey); // FIXED: Use LRU get method
    
    if (isCacheValid(cachedCount)) {
      return res.status(200).json({
        success: true,
        hasOutForDeliveryOrders: cachedCount.data > 0,
        count: cachedCount.data,
        cached: true
      });
    }

    // Find the customer associated with the user
    const customer = await Customer.findOne({ userId }).lean();
    
    if (!customer) {
      const emptyResult = {
        success: true,
        hasOutForDeliveryOrders: false,
        count: 0,
        message: 'Customer profile not found'
      };
      
      // Cache empty result too - FIXED: Use LRU set method
      notificationCache.set(countCacheKey, {
        data: 0,
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyResult);
    }

    // Count out for delivery orders for this customer
    const orderCount = await Order.countDocuments({
      buyerId: customer._id,
      status: 'out for delivery'
    });

    // Cache the count - FIXED: Use LRU set method
    notificationCache.set(countCacheKey, {
      data: orderCount,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      hasOutForDeliveryOrders: orderCount > 0,
      count: orderCount
    });

  } catch (error) {
    console.error('Error fetching out for delivery order count:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching out for delivery order count'
    });
  }
};

// Clear cache for a specific user (useful when notifications are updated)
export const clearNotificationCache = (userId) => {
  const keysToDelete = [
    getCacheKey(userId, 'tesda'),
    getCacheKey(userId, 'orders'),
    getCacheKey(userId, 'seller'),
    getCacheKey(userId, 'count'),
    getCacheKey(userId, 'jobApplications'),
    getCacheKey(userId, 'employer'),
    getCacheKey(userId, 'jobApplicationCount'),
    getCacheKey(userId, 'workerJobApplications'),
    getCacheKey(userId, 'worker'),
    getCacheKey(userId, 'workerJobApplicationCount'),
    getCacheKey(userId, 'outForDeliveryOrders'),
    getCacheKey(userId, 'outForDeliveryCount')
  ];
  
  keysToDelete.forEach(key => notificationCache.del(key)); // FIXED: Use LRU del method
};

// REMOVED: The setInterval cleanup is no longer needed with LRU cache
// LRU cache automatically handles eviction based on size and age

export default {
  getTesdaNotifications,
  getOrderNotifications,
  getJobApplicationNotifications,
  getWorkerJobApplicationNotifications,
  getOutForDeliveryOrders,
  getNotificationCount,
  getJobApplicationNotificationCount,
  getWorkerJobApplicationNotificationCount,
  getOutForDeliveryOrderCount,
  clearNotificationCache
};