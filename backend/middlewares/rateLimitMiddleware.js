import rateLimit from 'express-rate-limit';

// General rate limiter for notification endpoints
export const notificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More strict limiter for notification count endpoint
export const notificationCountLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 15, // limit each IP to 15 requests per 30 seconds
  message: {
    success: false,
    message: 'Too many requests for notification counts.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});