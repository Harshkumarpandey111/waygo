const Trip = require('../models/Trip');
const User = require('../models/User');
const { calculateCosts } = require('../utils/costCalculator');

// @desc    Get all trips for logged-in user
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res, next) => {
  try {
    const { status, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments(filter);

    res.json({
      success: true,
      count: trips.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      trips,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }
    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res, next) => {
  try {
    const {
      origin, destination, distance, travelDate, returnDate,
      travelers, transport, vehicleDetails, publicTransport, notes, title,
    } = req.body;

    // Auto-calculate cost breakdown
    const costBreakdown = calculateCosts({
      transport, distance, travelers,
      mileage: vehicleDetails?.mileage,
      fuelPrice: vehicleDetails?.fuelPrice,
      tollCharges: vehicleDetails?.tollCharges,
      farePerPerson: publicTransport?.farePerPerson,
      additionalCost: req.body.additionalCost || 0,
    });

    const trip = await Trip.create({
      user: req.user._id,
      title, origin, destination, distance,
      travelDate, returnDate, travelers, transport,
      vehicleDetails, publicTransport,
      costBreakdown, notes,
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalTrips: 1,
        totalDistance: distance,
        totalSpent: costBreakdown.total,
      },
    });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    // Recalculate costs if transport/distance changed
    if (req.body.transport || req.body.distance || req.body.vehicleDetails) {
      const data = { ...trip.toObject(), ...req.body };
      req.body.costBreakdown = calculateCosts({
        transport: data.transport,
        distance: data.distance,
        travelers: data.travelers,
        mileage: data.vehicleDetails?.mileage,
        fuelPrice: data.vehicleDetails?.fuelPrice,
        tollCharges: data.vehicleDetails?.tollCharges,
        farePerPerson: data.publicTransport?.farePerPerson,
      });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    await trip.deleteOne();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalTrips: -1,
        totalDistance: -(trip.distance || 0),
        totalSpent: -(trip.costBreakdown?.total || 0),
      },
    });

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user trip stats
// @route   GET /api/trips/stats
// @access  Private
const getTripStats = async (req, res, next) => {
  try {
    const stats = await Trip.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalSpent: { $sum: '$costBreakdown.total' },
          avgDistance: { $avg: '$distance' },
          avgCost: { $avg: '$costBreakdown.total' },
        },
      },
    ]);

    const transportBreakdown = await Trip.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$transport', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {},
      transportBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip, getTripStats };
