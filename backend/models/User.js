const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  rollNo: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'coordinator', 'admin'],
    default: 'student'
  },
  profilePhoto: { 
    type: String, 
    default: '' 
  },
  year: { 
    type: Number,
    default: null
  },
  branch: { 
    type: String,
    default: null
  },
  clubs: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Club' 
  }],
  coordinatingClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Virtual for password (to handle plain text passwords during creation)
userSchema.virtual('password')
  .set(function(password) {
    this.passwordHash = password;
  })
  .get(function() {
    return this.passwordHash;
  });

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
