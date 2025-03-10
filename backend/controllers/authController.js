const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Register a new user
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

// Login user
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

// Logout user
exports.logout = async (req, res) => {
  // TODO
  return res.status(200);
}
