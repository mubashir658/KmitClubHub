const mongoose = require('mongoose');

const studentRegisterSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: true,
    ref: 'User'
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique registration per student per event
studentRegisterSchema.index({ rollNo: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('StudentRegister', studentRegisterSchema);
