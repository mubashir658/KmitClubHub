const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kmitclubhub');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminData = {
      name: 'Admin',
      rollNo: 'ADMIN001',
      email: 'admin@kmit.in',
      passwordHash: 'admin123', // This will be hashed by the pre-save hook
      role: 'admin'
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('Admin user created successfully');
    console.log('Admin credentials:');
    console.log('Roll No: ADMIN001');
    console.log('Password: admin123');
    console.log('Email: admin@kmit.in');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedAdmin();
