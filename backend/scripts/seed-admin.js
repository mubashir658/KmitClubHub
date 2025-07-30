const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config(); // Loads from backend/.env

const MONGO_URI = process.env.MONGODB_URI;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const email = 'mubashir@gmail.com';
    const password = 'mubashir@786';
    const name = 'mubashir';

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, passwordHash });
    console.log('✅ Default admin created:', email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
