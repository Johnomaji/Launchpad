const Memecoin = require("../models/Memecoin");
const User = require("../models/User");
const NewCoin = require("../new_coin/script");

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
    if (!user) {
      throw new Error("User not found");
    }

    if (!name || !ticker || !desc || !image) {
      throw new Error("Missing required fields");
    }

    const generateMockSuiAddress = () => {
      const prefix = '0x';
      const characters = '0123456789abcdef'; // Sui addresses use lowercase hex
      let address = prefix;
    
      // Generate 64-character long string (Sui address length without 0x prefix)
      for (let i = 0; i < 64; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        address += characters[randomIndex];
      }
    
      return address;
    };
    
    // Generate new address each time
    let coinAddress = generateMockSuiAddress();

    // const deploymentResult = await NewCoin(name, ticker, image, desc);

    // const coinPackageId = deploymentResult.objectChanges.find(
    //   (change) => change.type === "published"
    // )?.packageId;

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
      // packageId: coinPackageId,
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
