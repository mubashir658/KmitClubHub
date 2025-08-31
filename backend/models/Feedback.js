const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Not required if feedback is from coordinator
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Not required if feedback is from student
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: false // Not required if feedback is to admin
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'suggestion', 'complaint', 'appreciation', 'issue', 'request'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'solved', 'escalated', 'forward_admin'],
    default: 'pending'
  },
  isToAdmin: {
    type: Boolean,
    default: false
  },
  responseMessage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
