const validateCoinRequest = (req, res, next) => {
  const { 
    name, 
    ticker, 
    creator, 
    image, 
    desc, 
    totalCoins, 
    xSocial, 
    telegramSocial, 
    discordSocial 
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Valid coin name is required'
    });
  }

  if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Valid coin ticker is required'
    });
  }

  if (!creator || typeof creator !== 'string' || creator.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Valid creator wallet address is required'
    });
  }

  if (!desc || typeof desc !== 'string' || desc.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Valid coin description is required'
    });
  }

  if (!totalCoins || isNaN(Number(totalCoins)) || Number(totalCoins) <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid total coins amount is required (must be a positive number)'
    });
  }

  if (!image || typeof image !== 'string' || image.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Valid image URL is required'
    });
  }

  try {
    new URL(image);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: 'Image must be a valid URL'
    });
  }

  const sanitizedName = name.replace(/\s+/g, '_').toLowerCase();
  if (sanitizedName.length < 3 || sanitizedName.length > 30) {
    return res.status(400).json({
      success: false,
      error: 'Coin name must be between 3 and 30 characters after sanitization'
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(sanitizedName)) {
    return res.status(400).json({
      success: false,
      error: 'Coin name can only contain alphanumeric characters and underscores after sanitization'
    });
  }

  if (ticker.length < 1 || ticker.length > 10) {
    return res.status(400).json({
      success: false,
      error: 'Coin ticker must be between 1 and 10 characters'
    });
  }

  if (xSocial !== undefined && (typeof xSocial !== 'string' || xSocial.trim() === '')) {
    return res.status(400).json({
      success: false,
      error: 'If provided, X social must be a valid string'
    });
  }

  if (telegramSocial !== undefined && (typeof telegramSocial !== 'string' || telegramSocial.trim() === '')) {
    return res.status(400).json({
      success: false,
      error: 'If provided, Telegram social must be a valid string'
    });
  }

  if (discordSocial !== undefined && (typeof discordSocial !== 'string' || discordSocial.trim() === '')) {
    return res.status(400).json({
      success: false,
      error: 'If provided, Discord social must be a valid string'
    });
  }
  next();
};

module.exports = {
  validateCoinRequest
};
