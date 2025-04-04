const Memecoin = require("../models/Memecoin");
const User = require("../models/User");
const { newCoin } = require('../utils/coinCreator');
const { UserNotFoundError, MemecoinExistsError } = require("../utils/errors");

exports.createMemecoin = async (req, res) => {
  const {
    name,
    ticker,
    creator,
    image,
    desc,
    totalCoins,
    xSocial,
    telegramSocial,
    discordSocial,
  } = req.body;

  try {
    const user = await User.findOne({ walletAddress: creator });
    const coin = await User.findOne({ name: name });

	if (!user) {
      throw new UserNotFoundError();
    }
    if (coin) {
      throw new MemecoinExistsError();
    }

	const deploymentResult = await newCoin(name, ticker, image, desc, "testnet");
    
    const memecoin = new Memecoin({
      name,
      ticker,
      coinAddress: deploymentResult.publishResult.packageId,
      creator,
      image,
      desc,
      totalCoins,
      xSocial,
      telegramSocial,
      discordSocial,
      packageId: deploymentResult.publishResult.packageId,
    });
    await memecoin.save();

    res
      .status(201)
      .json({ message: "Memecoin created successfully", memecoin });
  } catch (error) {
  	console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.getMemecoin = async (req, res) => {
  const { coinAddress } = req.params;

  console.log("coin address: ", coinAddress)

  try {
    const memecoin = await Memecoin.findOne({ coinAddress:coinAddress });
    if (!memecoin) return res.status(404).json({ error: "Memecoin not found" });

    res.status(200).json(memecoin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMemecoins = async (req, res) => {
  try {
    const memecoins = await Memecoin.find();
    if (!memecoins) return res.status(404).json({ error: "Memecoins not found" });
    res.status(200).json(memecoins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
