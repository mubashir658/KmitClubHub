const mongoose = require('mongoose');

const membershipApprovalSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  approvedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one approval record per (student, club)
membershipApprovalSchema.index({ student: 1, club: 1 }, { unique: true });

module.exports = mongoose.model('MembershipApproval', membershipApprovalSchema);


