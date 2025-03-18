const Memecoin = require("../models/Memecoin");
const User = require("../models/User");

exports.createMemecoin = async (req, res) => {
  const {
    name,
    ticker,
    coinAddress,
    creator,
    image,
    desc,
    totalCoins,
    xSocial,
    telegramSocial,
    discordSocial,
    creatorAddress,
  } = req.body;

  try {
    const user = await User.findOne({ walletAddress: creatorAddress });
    if (!user) {
      throw new Error("User not found");
    }
    const memecoin = new Memecoin({
      name,
      ticker,
      coinAddress,
      creator,
      image,
      desc,
      totalCoins,
      xSocial,
      telegramSocial,
      discordSocial,
    });
    await memecoin.save();

    res
      .status(201)
      .json({ message: "Memecoin created successfully", memecoin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMemecoin = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const memecoin = await Memecoin.findOne({ walletAddress });
    if (!memecoin) return res.status(404).json({ error: "Memecoin not found" });

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
