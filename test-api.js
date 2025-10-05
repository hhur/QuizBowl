const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API health endpoint...');
    const response = await fetch('http://localhost:3001/health');
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();