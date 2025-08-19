const axios = require('axios');

async function testSimpleSignup() {
  try {
    console.log('🧪 Testing Simplified Signup\n');

    // Test student registration with only essential fields
    console.log('1. Testing student registration (simplified)...');
    try {
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'John Doe',
        email: 'john.doe@kmit.in',
        password: 'password123',
        rollNo: '22CS002'
      });
      console.log('✅ Student registration successful!');
      console.log('   User ID:', registerResponse.data.user.id);
      console.log('   Name:', registerResponse.data.user.name);
      console.log('   Email:', registerResponse.data.user.email);
      console.log('   Roll No:', registerResponse.data.user.rollNo);
      console.log('   Year:', registerResponse.data.user.year);
      console.log('   Branch:', registerResponse.data.user.branch);
      console.log('   Token:', registerResponse.data.token.substring(0, 20) + '...');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('⚠️  Student already exists (expected)');
      } else {
        console.log('❌ Student registration failed:');
        console.log('   Status:', error.response?.status);
        console.log('   Message:', error.response?.data?.message);
      }
    }

    // Test login with the registered student
    console.log('\n2. Testing student login...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        rollNo: '22CS002',
        password: 'password123'
      });
      console.log('✅ Student login successful!');
      console.log('   Role:', loginResponse.data.user.role);
      console.log('   Year:', loginResponse.data.user.year);
      console.log('   Branch:', loginResponse.data.user.branch);
    } catch (error) {
      console.log('❌ Student login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }

    console.log('\n🎉 Simplified signup test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleSignup();
