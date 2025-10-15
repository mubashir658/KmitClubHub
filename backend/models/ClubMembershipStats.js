const mongoose = require('mongoose');

const clubMembershipStatsSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', unique: true, required: true },
  totalMembers: { type: Number, default: 0 },
  byYear: { type: Map, of: Number, default: {} },
  byBranch: { type: Map, of: Number, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClubMembershipStats', clubMembershipStatsSchema);


