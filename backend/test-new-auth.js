const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testStudent = {
  name: 'Test Student',
  email: 'test.student@kmit.in',
  password: 'password123',
  rollNo: '22CS001',
  year: 2,
  branch: 'CSE'
};

const adminCredentials = {
  rollNo: 'ADMIN001',
  password: 'admin123'
};

async function testAuth() {
  try {
    console.log('🧪 Testing New Authentication System\n');

    // Test 1: Student Registration
    console.log('1. Testing Student Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testStudent);
      console.log('✅ Student registration successful');
      console.log('   Token:', registerResponse.data.token.substring(0, 20) + '...');
      console.log('   User ID:', registerResponse.data.user.id);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('⚠️  Student already exists (expected if test was run before)');
      } else {
        console.log('❌ Student registration failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 2: Admin Login
    console.log('\n2. Testing Admin Login...');
    try {
      const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, adminCredentials);
      console.log('✅ Admin login successful');
      console.log('   Role:', adminLoginResponse.data.user.role);
      console.log('   Token:', adminLoginResponse.data.token.substring(0, 20) + '...');
      
      const adminToken = adminLoginResponse.data.token;
      
      // Test 3: Get Admin Profile
      console.log('\n3. Testing Get Admin Profile...');
      const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Admin profile retrieved successfully');
      console.log('   Name:', profileResponse.data.name);
      console.log('   Role:', profileResponse.data.role);

      // Test 4: Student Login
      console.log('\n4. Testing Student Login...');
      const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        rollNo: testStudent.rollNo,
        password: testStudent.password
      });
      console.log('✅ Student login successful');
      console.log('   Role:', studentLoginResponse.data.user.role);
      console.log('   Year:', studentLoginResponse.data.user.year);
      console.log('   Branch:', studentLoginResponse.data.user.branch);

    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Authentication system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuth();
