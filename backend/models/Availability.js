const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start: String,
  end: String
});

const dayAvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  slots: [timeSlotSchema]
});

const availabilitySchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  workingHours: [dayAvailabilitySchema],
  exceptions: [{
    date: Date,
    isAvailable: Boolean,
    slots: [timeSlotSchema]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Availability', availabilitySchema);