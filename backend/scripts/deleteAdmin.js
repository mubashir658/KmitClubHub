// deleteAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const deleteAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/kmitclubhub',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ Connected to MongoDB');

    // Find and delete admin user
    const deletedAdmin = await User.findOneAndDelete({ role: 'admin' });
    if (deletedAdmin) {
      console.log('✅ Admin user deleted successfully');
      console.log('   Name:', deletedAdmin.name);
      console.log('   Roll No:', deletedAdmin.rollNo);
      console.log('   Email:', deletedAdmin.email);
    } else {
      console.log('⚠️ No admin user found to delete');
    }

  } catch (error) {
    console.error('❌ Error deleting admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the delete function
deleteAdmin(); 