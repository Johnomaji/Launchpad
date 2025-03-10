/**
 * Custom error class for handling application-specific errors
*/
class AppError extends Error {
  /**
   * Create a new AppError instance
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture the stack trace (excluding this constructor from the stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
