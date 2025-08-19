const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin with roll number 5555544444 already exists
    const existingAdmin = await User.findOne({ rollNo: '5555544444' });
    if (existingAdmin) {
      console.log('✅ Admin already exists.');
      process.exit(0);
    }

    // Hash password Kmit123
    const passwordHash = await bcrypt.hash('Kmit123', 10);
    
    // Create admin with specified details
    await User.create({
      rollNo: '5555544444',
      name: 'Super Admin',
      email: 'admin@kmit.in',
      passwordHash,
      role: 'admin',
      profilePhoto: '',
      year: null,
      branch: '',
      clubs: []
    });
    
    console.log('✅ Default Admin Created!');
    console.log('Roll No: 5555544444');
    console.log('Password: Kmit123');
    console.log('Email: admin@kmit.in');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

seedAdmin();
