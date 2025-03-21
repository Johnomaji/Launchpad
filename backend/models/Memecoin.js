const mongoose = require('mongoose');

const memecoinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  coinAddress: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, default: '' },
  desc: {type: String, default: ''},
  totalCoins: { type: Number, default: 0 },
  xSocial:{type: String, default: ''},
  telegramSocial: {type: String, default: ''},
  discordSocial: {type: String, default: ''},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Memecoin', memecoinSchema);