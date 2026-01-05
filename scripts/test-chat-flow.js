const fetch = require('node-fetch'); // You might need to install this if not available, or use built-in fetch in Node 18+

const BASE_URL = 'http://localhost:8000'; // Adjust if needed
// const BASE_URL = 'https://vibe-backend.truegradient.ai';

async function testChatFlow() {
  console.log('🚀 Starting Chat Flow Test...');

  try {
    // 1. Health Check
    console.log('\n1️⃣  Checking Health...');
    const health = await fetch(`${BASE_URL}/health`);
    console.log(`Status: ${health.status}`);
    if (!health.ok) throw new Error('Health check failed');

    // 2. Create Conversation
    console.log('\n2️⃣  Creating Conversation...');
    const createRes = await fetch(`${BASE_URL}/create-conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: 'test-user', companyID: 'test-company' })
    });
    const createData = await createRes.json();
    console.log('Response:', createData);
    
    // Mock token processing if needed, assuming direct response for now
    const conversationID = createData.conversation_id || createData.conversationID;
    if (!conversationID) console.warn('⚠️  No conversationID returned');

    // 3. Send Message (Mock)
    console.log('\n3️⃣  Sending Message...');
    // Note: This usually requires a WebSocket connection in your app
    console.log('ℹ️  Skipping WebSocket test in simple script. Use the app to test real-time flow.');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
  }
}

testChatFlow();
