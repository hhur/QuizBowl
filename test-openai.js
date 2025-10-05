require('dotenv').config();
const OpenAI = require('openai');

console.log('Testing OpenAI connection...');
console.log('API Key configured:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'None');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds
  maxRetries: 1,
});

async function testConnection() {
  try {
    console.log('\n🔍 Testing OpenAI API connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'Hello, this is a test!'"
        }
      ],
      max_tokens: 50,
      temperature: 0.1,
    });

    console.log('✅ Connection successful!');
    console.log('Response:', completion.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  }
}

testConnection();