const express = require('express');
const router = express.Router();
const { getNearby, getFuelPrices } = require('../controllers/placesController');

router.get('/nearby', getNearby);
router.get('/fuel-prices', getFuelPrices);

module.exports = router;
