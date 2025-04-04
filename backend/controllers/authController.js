const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         walletAddress:
 *           type: string
 *           description: The user's SUI wallet address.
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *         username:
 *           type: string
 *           description: The user's username.
 *           example: "john_doe"
 *         bio:
 *           type: string
 *           description: The user's bio.
 *           example: "Blockchain enthusiast and developer."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created.
 *           example: "2025-03-10T12:00:00Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: The user's SUI wallet address (must be a valid 64-character hex string starting with 0x).
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *               username:
 *                 type: string
 *                 description: The user's desired username (optional, must be at least 3 characters long).
 *                 example: "john_doe"
 *               bio:
 *                 type: string
 *                 description: A short bio for the user (optional).
 *                 example: "Blockchain enthusiast and developer."
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (e.g., user already exists or invalid wallet address).
 *       500:
 *         description: Server error.
 */
exports.register = async (req, res) => {
  const { walletAddress, username, bio } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ walletAddress });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      walletAddress,
      username,
      bio
    });

    await user.save();

    // TODO: CHANGE THISSSSS!!!!!!!!
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: The user's SUI wallet address (must be a valid 64-character hex string starting with 0x).
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *               signature:
 *                 type: string
 *                 description: The signed message for authentication.
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (e.g., invalid credentials or missing fields).
 *       500:
 *         description: Server error.
 */
exports.login = async (req, res) => {
  const { walletAddress } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // TODO: Generate JWT token (or not, since we're using next-auth

    res.status(200).json({ /** token */ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       401:
 *         description: Unauthorized (e.g., missing or invalid token).
 *       500:
 *         description: Server error.
 */
exports.logout = async (req, res) => {
  // TODO
  return res.status(200);
}
