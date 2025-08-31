const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function updateExistingCoordinator() {
  console.log('🔧 Updating existing coordinator...\n');

  try {
    // Step 1: Admin login
    console.log('1. Admin login...');
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, {
      rollNo: 'ADMIN001',
      password: 'admin123'
    });
    const adminToken = adminResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Get clubs
    console.log('\n2. Getting clubs...');
    const clubsResponse = await axios.get(`${BASE_URL}/clubs`);
    const clubs = clubsResponse.data;
    console.log('✅ Found clubs:', clubs.length);
    
    if (clubs.length === 0) {
      console.log('❌ No clubs available');
      return;
    }

    // Step 3: Create a new coordinator with the same details but with club assignment
    console.log('\n3. Creating new coordinator with club assignment...');
    const newCoordData = {
      name: 'mohammed mubashir ali',
      rollNo: '58_new', // Use different roll number
      email: 'coordinator1_new@gmail.com',
      password: '123456',
      clubId: clubs[0]._id
    };

    const createResponse = await axios.post(`${BASE_URL}/auth/create-coordinator`, newCoordData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ New coordinator created with club assignment');

    // Step 4: Test the new coordinator
    console.log('\n4. Testing new coordinator login...');
    const newCoordResponse = await axios.post(`${BASE_URL}/auth/login`, {
      rollNo: '58_new',
      password: '123456'
    });
    const newCoordToken = newCoordResponse.data.token;
    console.log('✅ New coordinator login successful');

    // Step 5: Test profile
    console.log('\n5. Testing new coordinator profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${newCoordToken}` }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('   Coordinating Club:', profileResponse.data.coordinatingClub);

    // Step 6: Test events endpoint
    console.log('\n6. Testing events endpoint with new coordinator...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events/coordinator/my-events`, {
        headers: { Authorization: `Bearer ${newCoordToken}` }
      });
      console.log('✅ Events endpoint successful');
      console.log('   Events count:', eventsResponse.data.length);
    } catch (error) {
      console.log('❌ Events endpoint failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }

    // Step 7: Test event creation
    console.log('\n7. Testing event creation with new coordinator...');
    try {
      const eventData = {
        title: 'Test Event from New Coordinator',
        description: 'This is a test event from the new coordinator',
        date: '2024-12-25',
        time: '14:00',
        venue: 'Test Venue',
        imageUrl: ''
      };
      
      const createEventResponse = await axios.post(`${BASE_URL}/events`, eventData, {
        headers: { Authorization: `Bearer ${newCoordToken}` }
      });
      console.log('✅ Event creation successful');
      console.log('   Event ID:', createEventResponse.data._id);
    } catch (error) {
      console.log('❌ Event creation failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📝 Summary:');
    console.log('   - New coordinator created with rollNo: 58_new');
    console.log('   - Email: coordinator1_new@gmail.com');
    console.log('   - Password: 123456');
    console.log('   - Assigned to club:', clubs[0].name);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

updateExistingCoordinator();
