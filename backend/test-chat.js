const axios = require('axios');

async function testChat() {
  const queries = [
    'who is the coordinator of Aalap?',
    'how many members are in Aalap?',
    'what are the upcoming events for Aalap?'
  ];

  for (const q of queries) {
    console.log(`\n--- Testing Query: "${q}" ---`);
    try {
      const response = await axios.post('http://localhost:5000/api/chat', { 
        messages: [{ role: 'user', content: q }] 
      });
      console.log('Bot Reply:', response.data.reply);
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

testChat();
