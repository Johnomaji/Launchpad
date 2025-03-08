const express = require('express');
const memecoinController = require('../controllers/memecoinController');

const router = express.Router();

router.post('/create', memecoinController.createMemecoin);
router.get('/:walletAddress', memecoinController.getMemecoin);
router.get('/all', memecoinController.getAllMemecoins);

module.exports = router;