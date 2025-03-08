const Memecoin = require('../models/Memecoin');

exports.createMemecoin = async (req, res) => {
  const { name, symbol, walletAddress } = req.body;

  try {
    const memecoin = new Memecoin({ name, symbol, walletAddress });
    await memecoin.save();

    res.status(201).json({ message: 'Memecoin created successfully', memecoin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMemecoin = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const memecoin = await Memecoin.findOne({ walletAddress });
    if (!memecoin) return res.status(404).json({ error: 'Memecoin not found' });

    res.status(200).json(memecoin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMemecoins = async (req, res) => {
  try {
    const memecoins = await Memecoin.find();
    res.status(200).json(memecoins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};