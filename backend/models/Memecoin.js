const mongoose = require('mongoose');

const memecoinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  walletAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Memecoin', memecoinSchema);