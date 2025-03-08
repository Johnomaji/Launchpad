const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);