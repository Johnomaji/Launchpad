const { validationResult } = require('express-validator');

/**
 * Process validation errors from express-validator
 * and return a consistent error response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for a consistent API response
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: formattedErrors
    });
  }

  next();
};

/**
 * Custom validator for checking if a value exists in the database
 * 
 * @param {Model} model - Mongoose model to query
 * @param {String} field - Field to check
 * @param {String} message - Error message if validation fails
 * @param {Boolean} shouldExist - Whether the value should exist or not
 * @returns {Function} - Express-validator custom validator
 */
exports.checkExists = (model, field, message, shouldExist = true) => {
  return async (value) => {
    const query = {};
    query[field] = value;
    
    const exists = await model.exists(query);
    
    if ((shouldExist && !exists) || (!shouldExist && exists)) {
      throw new Error(message);
    }
    
    return true;
  };
};

/**
 * Sanitize and trim input values
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.sanitizeInput = (req, res, next) => {
  // If there's a body, sanitize its fields
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};
