const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const coordinatorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  rollNo: { 
    type: String, 
    required: true, 
    unique: true 
  },
  club: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Hash password before saving
coordinatorSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
coordinatorSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('Coordinator', coordinatorSchema); 