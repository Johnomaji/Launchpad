const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('walletAddress')
      .matches(/^0x[0-9a-f]{64}$/i)
      .withMessage('Valid SUI Wallet address is required'),
    body('username')
      .optional()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    validateRequest
  ],
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many login attempts, please try again later' }),
  [
    body('walletAddress')
      .matches(/^0x[0-9a-f]{64}$/i)
      .withMessage('Valid SUI Wallet address is required'),
    body('signature').exists().withMessage('Signature is required'),
    validateRequest
  ],
  authController.login
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authController.logout);

module.exports = router;
