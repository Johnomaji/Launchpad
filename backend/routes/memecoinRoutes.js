const express = require('express');
const memecoinController = require('../controllers/memecoinController');
const { validateCoinRequest } = require('../middleware/validateCoinRequest');
const router = express.Router();

router.post('/create', validateCoinRequest, memecoinController.createMemecoin);
router.get('/all', memecoinController.getAllMemecoins);
router.get('/:coinAddress', memecoinController.getMemecoin);

module.exports = router;
