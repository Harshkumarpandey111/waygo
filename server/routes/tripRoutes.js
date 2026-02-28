const express = require('express');
const router = express.Router();
const {
  getTrips, getTripById, createTrip,
  updateTrip, deleteTrip, getTripStats,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All trip routes require auth

router.get('/stats', getTripStats);
router.route('/').get(getTrips).post(createTrip);
router.route('/:id').get(getTripById).put(updateTrip).delete(deleteTrip);

module.exports = router;
