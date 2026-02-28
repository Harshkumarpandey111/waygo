const mongoose = require('mongoose');

const costBreakdownSchema = new mongoose.Schema({
  fuel: { type: Number, default: 0 },
  toll: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  parking: { type: Number, default: 0 },
  fare: { type: Number, default: 0 },
  accommodation: { type: Number, default: 0 },
  miscellaneous: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: 1,
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    travelers: {
      type: Number,
      default: 1,
      min: 1,
    },
    transport: {
      type: String,
      enum: ['car', 'bike', 'bus', 'train', 'flight', 'cab'],
      required: true,
    },
    // Personal vehicle fields
    vehicleDetails: {
      mileage: { type: Number, default: 0 },
      fuelPrice: { type: Number, default: 96 },
      tollCharges: { type: Number, default: 0 },
      fuelType: { type: String, default: 'Petrol' },
    },
    // Public transport fields
    publicTransport: {
      provider: { type: String, default: '' },
      fareClass: { type: String, default: '' },
      farePerPerson: { type: Number, default: 0 },
    },
    costBreakdown: costBreakdownSchema,
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Auto-generate title if not provided
tripSchema.pre('save', function (next) {
  if (!this.title) {
    this.title = `${this.origin} → ${this.destination}`;
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
