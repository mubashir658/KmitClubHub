const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      rollNo: 'ADMIN001',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
  }
}

testAdminLogin();
