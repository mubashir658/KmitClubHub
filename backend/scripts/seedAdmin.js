// seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();
require('dotenv').config({ path: __dirname + '/../.env' });

const seedAdmin = async () => {
  try {
    // Connect to MongoDB Atlas using env variable
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI not found in .env');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return;
    }

    // Create admin user
    const adminData = {
      name: 'Admin',
      rollNo: 'ADMIN001',
      email: 'admin@kmit.in',
      password: 'admin123',
      role: 'admin',
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully');
    console.log('--- Admin Credentials ---');
    console.log('Email:    admin@kmit.in');
    console.log('Roll No:  ADMIN001');
    console.log('Password: admin123 (hashed in DB)');

  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
seedAdmin();
