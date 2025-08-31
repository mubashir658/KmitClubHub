const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  logoUrl: { 
    type: String 
  },
  category: { 
    type: String, 
    required: true 
  },
  coordinators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  gallery: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Gallery' 
  }],
  clubKey: { 
    type: String, 
    required: true 
  },
  enrollmentOpen: { 
    type: Boolean,
    default: false
  },
  teamHeads: [{
    name: String,
    rollNumber: String,
    designation: String
  }],
  eventsConducted: [String],
  upcomingEvents: [String],
  instagram: String,
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
clubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Club', clubSchema);