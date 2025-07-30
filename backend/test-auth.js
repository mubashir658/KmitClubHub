const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Fresh KMIT Club Hub Authentication\n');

    // Test 1: Health check
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);
    console.log('');

    // Test 2: Register student
    console.log('2. Testing student registration...');
    const registerData = {
      name: 'Test Student',
      email: 'test@student.com',
      password: 'password123',
      rollNo: '20CS001'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('   User ID:', registerResponse.data.user.id);
    console.log('   Role:', registerResponse.data.user.role);
    console.log('   Token received:', !!registerResponse.data.token);
    console.log('');

    // Test 3: Login student
    console.log('3. Testing student login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password,
      role: 'student'
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   Token received:', !!loginResponse.data.token);
    console.log('');

    // Test 4: Get profile
    console.log('4. Testing profile access...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile access successful');
    console.log('   Name:', profileResponse.data.name);
    console.log('   Email:', profileResponse.data.email);
    console.log('   Role:', profileResponse.data.role);
    console.log('');

    console.log('🎉 All tests passed! Authentication system is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Backend server is running: npm run dev');
    console.log('2. MongoDB Atlas is connected');
    console.log('3. .env file is properly configured');
  }
}

testAuth(); 