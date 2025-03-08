const User = require('../models/User');

exports.getProfile = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { walletAddress } = req.params;
  const { username, bio } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress },
      { username, bio },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};