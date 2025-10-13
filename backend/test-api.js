const axios = require('axios');

async function testClubAPI() {
  try {
    console.log('Testing club API...');
    
    // Test with a sample ID (you'll need to replace this with a real ID from your database)
    const testId = '64a1b2c3d4e5f67890123456';
    
    const response = await axios.get(`http://localhost:5000/api/clubs/${testId}`);
    
    console.log(' API Response:', response.data);
  } catch (error) {
    console.error(' API Error:', error.response?.data || error.message);
  }
}

testClubAPI(); 