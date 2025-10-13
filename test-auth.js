const axios = require('axios');

async function testAuth() {
  try {
    // Test login first
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      rollNo: 'admin',
      password: 'admin123'
    });
    
    console.log('Login successful:', loginResponse.data);
    const token = loginResponse.data.token;
    
    // Test profile endpoint with token
    console.log('Testing profile endpoint...');
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile response:', profileResponse.data);
    
    // Test user profile update
    console.log('Testing profile update...');
    const updateResponse = await axios.put('http://localhost:5000/api/users/profile', {
      name: 'Updated Name'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Update response:', updateResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAuth();


