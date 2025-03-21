const express = require('express');
const memecoinController = require('../controllers/memecoinController');

const router = express.Router();

router.post('/create', memecoinController.createMemecoin);
router.get('/all', memecoinController.getAllMemecoins);
router.get('/:coinAddress', memecoinController.getMemecoin);

module.exports = router;