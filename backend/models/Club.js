const mongoose = require('mongoose');

const teamHeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true },
  designation: { type: String, required: true }
}, { _id: false });

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logoUrl: { type: String, required: true }, // URL or path to logo
  description: { type: String, required: true },
  instagramLink: { type: String },
  teamHeads: [teamHeadSchema],
  eventsConducted: [String],
  upcomingEvents: [String],
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);