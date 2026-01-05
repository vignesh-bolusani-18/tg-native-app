// AUTH TOKEN FLOW TEST SCRIPT
// Run this after login to verify token storage and retrieval

import { getSecureItem } from './jwtUtils';

async function testTokenFlow() {
  console.log('\n=== AUTH TOKEN FLOW TEST ===\n');

  // Check all stored tokens
  const tokens = {
    token: await getSecureItem('token'),
    refresh_token: await getSecureItem('refresh_token'),
    refresh_auth_token: await getSecureItem('refresh_auth_token'),
    refresh_token_company: await getSecureItem('refresh_token_company'),
    userToken: await getSecureItem('userToken'),
  };

  console.log('📦 Stored Tokens:');
  Object.entries(tokens).forEach(([key, value]) => {
    if (value) {
      console.log(`  ✅ ${key}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`  ❌ ${key}: NOT FOUND`);
    }
  });

  // Test getAuthToken function
  const { getAuthToken } = await import('../redux/actions/authActions');
  const authToken = await getAuthToken();
  
  console.log('\n🔑 getAuthToken result:', authToken ? `${authToken.substring(0, 20)}...` : 'NULL');

  // Test API call with token
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

  if (authToken) {
    console.log('\n🧪 Testing API call with token...');
    try {
      const response = await fetch(`${API_BASE_URL}/conversationByCompany?t=${Date.now()}&sendHash=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'x-api-key': API_KEY,
        },
      });

      console.log(`📡 API Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API call successful!');
        console.log(`   Conversations found: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } else {
        const errorText = await response.text();
        console.log('❌ API call failed:', errorText);
      }
    } catch (error) {
      console.log('❌ API call error:', error.message);
    }
  } else {
    console.log('⚠️ No token available for API test');
  }

  console.log('\n=== TEST COMPLETE ===\n');
}

// Export for use in app
export { testTokenFlow };

// Auto-run if called directly
if (typeof window !== 'undefined') {
  window.testTokenFlow = testTokenFlow;
  console.log('💡 Run window.testTokenFlow() to test auth flow');
}
