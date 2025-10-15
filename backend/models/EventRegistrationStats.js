const mongoose = require('mongoose');

const eventRegistrationStatsSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', unique: true, required: true },
  totalRegistrations: { type: Number, default: 0 },
  byYear: { type: Map, of: Number, default: {} },
  byBranch: { type: Map, of: Number, default: {} },
  byClub: { type: Map, of: Number, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventRegistrationStats', eventRegistrationStatsSchema);


