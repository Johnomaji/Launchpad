const rateLimit = require('express-rate-limit');

/**
 * Creates a rate limiter middleware with customizable options
 * 
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests in the time window
 * @param {string} options.message - Error message to send when limit is exceeded
 * @returns {Function} Express middleware function
 */
exports.rateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes by default
    max: 100, // 100 requests per windowMs by default
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting in test environment
    skip: () => process.env.NODE_ENV === 'test'
  };

  // Merge default options with provided options
  const limiterOptions = { ...defaultOptions, ...options };

  return rateLimit(limiterOptions);
};

/**
 * Global rate limiter for all API routes
 */
exports.globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test'
});

/**
 * Stricter rate limiter for sensitive operations
 */
exports.strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test'
});
