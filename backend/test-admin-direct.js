const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAdminDirect() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kmitclubhub');
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   Name:', admin.name);
    console.log('   Roll No:', admin.rollNo);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);

    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await admin.comparePassword(testPassword);
    console.log('   Password match:', isMatch);

    if (isMatch) {
      console.log('✅ Admin credentials are correct');
    } else {
      console.log('❌ Admin password is incorrect');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAdminDirect();
