const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testRoleBasedSignup() {
  try {
    console.log('🧪 Testing Role-Based Signup Functionality\n');

    // Test 1: Health check
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);
    console.log('');

    // Test 2: Register Admin
    console.log('2. Testing admin registration...');
    const adminData = {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      rollNo: 'ADMIN001',
      role: 'admin'
    };
    
    const adminResponse = await axios.post(`${BASE_URL}/auth/register`, adminData);
    console.log('✅ Admin registration successful:', adminResponse.data.message);
    console.log('   User ID:', adminResponse.data.user.id);
    console.log('   Role:', adminResponse.data.user.role);
    console.log('   Token received:', !!adminResponse.data.token);
    console.log('');

    // Test 3: Register Coordinator
    console.log('3. Testing coordinator registration...');
    const coordinatorData = {
      name: 'Test Coordinator',
      email: 'coordinator@test.com',
      password: 'password123',
      rollNo: 'COORD001',
      role: 'coordinator'
    };
    
    const coordinatorResponse = await axios.post(`${BASE_URL}/auth/register`, coordinatorData);
    console.log('✅ Coordinator registration successful:', coordinatorResponse.data.message);
    console.log('   User ID:', coordinatorResponse.data.user.id);
    console.log('   Role:', coordinatorResponse.data.user.role);
    console.log('   Token received:', !!coordinatorResponse.data.token);
    console.log('');

    // Test 4: Register Student
    console.log('4. Testing student registration...');
    const studentData = {
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      rollNo: 'STUDENT001',
      role: 'student'
    };
    
    const studentResponse = await axios.post(`${BASE_URL}/auth/register`, studentData);
    console.log('✅ Student registration successful:', studentResponse.data.message);
    console.log('   User ID:', studentResponse.data.user.id);
    console.log('   Role:', studentResponse.data.user.role);
    console.log('   Token received:', !!studentResponse.data.token);
    console.log('');

    // Test 5: Login as Admin
    console.log('5. Testing admin login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminData.email,
      password: adminData.password,
      role: 'admin'
    });
    console.log('✅ Admin login successful:', adminLoginResponse.data.message);
    console.log('   Token received:', !!adminLoginResponse.data.token);
    console.log('');

    // Test 6: Login as Coordinator
    console.log('6. Testing coordinator login...');
    const coordinatorLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: coordinatorData.email,
      password: coordinatorData.password,
      role: 'coordinator'
    });
    console.log('✅ Coordinator login successful:', coordinatorLoginResponse.data.message);
    console.log('   Token received:', !!coordinatorLoginResponse.data.token);
    console.log('');

    // Test 7: Login as Student
    console.log('7. Testing student login...');
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: studentData.email,
      password: studentData.password,
      role: 'student'
    });
    console.log('✅ Student login successful:', studentLoginResponse.data.message);
    console.log('   Token received:', !!studentLoginResponse.data.token);
    console.log('');

    console.log('🎉 All role-based signup tests passed!');
    console.log('✅ Admin, Coordinator, and Student registration and login are working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Backend server is running: npm run dev');
    console.log('2. MongoDB Atlas is connected');
    console.log('3. .env file is properly configured');
    console.log('4. All models (Admin, Coordinator, Student) have rollNo fields');
  }
}

testRoleBasedSignup(); 