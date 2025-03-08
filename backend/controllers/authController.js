const User = require('../models/User');

exports.login = async (req, res) => {
  const { walletAddress } = req.body;

  try {
    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }

    res.status(200).json({ message: 'User logged in successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};