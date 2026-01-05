// scripts/test-validateUser.js
// Test script to verify /validateUser endpoint works with Cognito JWT

require('dotenv').config();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

async function testValidateUser(cognitoToken) {
  console.log('='.repeat(60));
  console.log('TESTING /validateUser ENDPOINT');
  console.log('='.repeat(60));
  console.log('API URL:', API_BASE_URL);
  console.log('API Key:', API_KEY?.substring(0, 20) + '...');
  console.log('Token:', cognitoToken?.substring(0, 50) + '...');
  console.log('');

  try {
    const url = `${API_BASE_URL}/validateUser?t=${Date.now()}`;
    console.log('Full URL:', url);
    console.log('Making request...\n');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cognitoToken}`,
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ERROR Response Body:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ SUCCESS! Response:', JSON.stringify(data, null, 2));
    console.log('');
    console.log('isValidUser:', data.isValidUser);
    console.log('Has user token:', !!data.user);
    console.log('Has refreshToken:', !!data.refreshToken);
    
    if (data.refreshToken) {
      console.log('refreshToken (first 50 chars):', data.refreshToken.substring(0, 50) + '...');
    }

    return data;
  } catch (error) {
    console.error('❌ VALIDATION FAILED:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Usage: node scripts/test-validateUser.js YOUR_COGNITO_JWT_TOKEN
const cognitoToken = process.argv[2];

if (!cognitoToken) {
  console.error('❌ ERROR: No Cognito JWT token provided');
  console.log('');
  console.log('Usage: node scripts/test-validateUser.js <COGNITO_JWT_TOKEN>');
  console.log('');
  console.log('To get a Cognito JWT token:');
  console.log('1. Login with OTP in the mobile app');
  console.log('2. Check console logs for "🔑 Access Token (JWT):"');
  console.log('3. Copy the token and pass it as argument');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/test-validateUser.js eyJraWQiOiIzUzN0Vkw0...');
  process.exit(1);
}

testValidateUser(cognitoToken)
  .then(() => {
    console.log('\n✅ TEST PASSED - /validateUser works correctly!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n❌ TEST FAILED - /validateUser has issues');
    console.log('This is why your app is using Cognito JWT for /companies');
    process.exit(1);
  });
