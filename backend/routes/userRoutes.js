const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile/:walletAddress', userController.getProfile);
router.put('/profile/:walletAddress', userController.updateProfile);

module.exports = router;