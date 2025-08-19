const axios = require('axios');

async function debugAuth() {
  try {
    console.log('🔍 Debugging Authentication System\n');

    // Test 1: Health check
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is running');
      console.log('   Response:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }

    // Test 2: Admin login
    console.log('\n2. Testing admin login...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        rollNo: 'ADMIN001',
        password: 'admin123'
      });
      console.log('✅ Admin login successful');
      console.log('   User:', loginResponse.data.user);
      console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
    } catch (error) {
      console.log('❌ Admin login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full error:', error.message);
    }

    // Test 3: Student registration (simplified)
    console.log('\n3. Testing student registration...');
    try {
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test Student',
        email: 'test.student@kmit.in',
        password: 'password123',
        rollNo: '22CS001'
      });
      console.log('✅ Student registration successful');
      console.log('   User ID:', registerResponse.data.user.id);
      console.log('   Year:', registerResponse.data.user.year);
      console.log('   Branch:', registerResponse.data.user.branch);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('⚠️  Student already exists (expected)');
      } else {
        console.log('❌ Student registration failed:');
        console.log('   Status:', error.response?.status);
        console.log('   Message:', error.response?.data?.message);
      }
    }

    // Test 4: Student login
    console.log('\n4. Testing student login...');
    try {
      const studentLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        rollNo: '22CS001',
        password: 'password123'
      });
      console.log('✅ Student login successful');
      console.log('   Role:', studentLoginResponse.data.user.role);
      console.log('   Year:', studentLoginResponse.data.user.year);
      console.log('   Branch:', studentLoginResponse.data.user.branch);
    } catch (error) {
      console.log('❌ Student login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugAuth();
