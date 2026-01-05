// Test OAuth callback manually
// Run this in Metro console by pressing 'j' for debugger, then paste this code

console.log('=== OAUTH CALLBACK TEST ===');

// Test 1: Check if deep link handler is registered
console.log('\n1. Testing deep link setup...');
import('expo-linking').then(Linking => {
  console.log('✅ Linking module loaded');
  
  // Get current URL scheme
  const scheme = 'tgreactnativemobileapp';
  console.log(`App scheme: ${scheme}://`);
});

// Test 2: Check SecureStore
console.log('\n2. Checking stored tokens...');
import('expo-secure-store').then(SecureStore => {
  SecureStore.getItemAsync('token').then(token => {
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 30) + '...');
      
      // Decode JWT
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', {
            email: payload.email,
            sub: payload.sub,
            exp: new Date(payload.exp * 1000),
          });
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
    } else {
      console.log('❌ No token found in SecureStore');
    }
  });
  
  SecureStore.getItemAsync('refresh_token').then(rt => {
    console.log('Refresh token exists:', !!rt);
  });
  
  SecureStore.getItemAsync('refresh_auth_token').then(rat => {
    console.log('Refresh auth token exists:', !!rat);
  });
});

// Test 3: Check Redux state
console.log('\n3. Checking Redux auth state...');
// This will show in the Redux DevTools if you have it

console.log('\n=== TEST INSTRUCTIONS ===');
console.log('1. Tap "Continue with Google" button');
console.log('2. Watch Metro console for these logs:');
console.log('   - 🔵 Google OAuth: Opening URL:');
console.log('   - 🔵 Full URL received:');
console.log('   - 🔵 Extracted tokens:');
console.log('   - ✅ OAuth: Redux state updated');
console.log('\n3. If redirected to web URL instead:');
console.log('   - Backend is NOT redirecting to: tgreactnativemobileapp://');
console.log('   - Check backend OAuth redirect_uri configuration');
console.log('   - Should use the redirect_uri parameter from the request');
