# Authentication Testing Guide

## Setup Checklist

### 1. Environment Variables (.env)
Ensure these are set:
```
EXPO_PUBLIC_USER_POOL_ID=your-cognito-pool-id
EXPO_PUBLIC_USER_POOL_WEB_CLIENT_ID=your-client-id
EXPO_PUBLIC_IDENTITY_GATEWAY_URL=https://your-identity-gateway.com
```

### 2. Deep Linking Configuration
The app scheme is: `tgreactnativemobileapp://`
Redirect URIs should include: `tgreactnativemobileapp://auth/oauth-callback`

### 3. Google OAuth Configuration
Your Identity Gateway must:
- Accept the redirect URI above
- Return tokens in URL hash: `#access_token=...&refresh_token=...`
- OR use standard OAuth query params: `?code=...`

## Testing Signup/Login

### Manual Testing Steps

#### 1. **Standard Cognito Signup** (Not Functional - No OTP)
The current signup flow expects:
- Cognito to send verification email/SMS
- User to enter OTP code

**Issue:** Your Cognito pool may not have email/SMS configured for verification.

**Fix Options:**
- A) Enable email verification in Cognito console
- B) Switch to admin-confirmed users (auto-verify)
- C) Use Google OAuth instead (recommended)

#### 2. **Cognito Login**
Test path: Auth/Login screen → Fill form → Submit

Expected flow:
```
1. Fill: Company Name, Email, Password
2. Tap "Log in"
3. Check Metro console for:
   - "Login Values:" with your input
   - "Auth Config Loaded:" verifying pool IDs
4. On success: redirects to (tabs)
5. On failure: error banner appears
```

**Test credentials:**
- Use an existing Cognito user
- Company name must match the Cognito username suffix pattern

#### 3. **Google OAuth (Newly Added)**
Test path: Auth/Login → "Continue with Google" button

Expected flow:
```
1. Tap "Continue with Google"
2. Browser opens with Google login
3. After Google auth:
   - Redirects to: tgreactnativemobileapp://auth/oauth-callback#access_token=...
4. App extracts token, saves to SecureStore
5. Redirects to (tabs)
```

**Debug Console Logs:**
- `🔵 Google OAuth: Opening URL:` - auth URL opened
- `🔵 OAuth Callback URL:` - received callback
- `🔵 Extracted tokens:` - token extraction status
- `✅ OAuth: Redux state updated` - success

## Testing Commands

### 1. Check Stored Tokens (Add temp debug button)
```javascript
// Temporarily add to Login.js for testing
import * as SecureStore from 'expo-secure-store';

const debugCheckToken = async () => {
  const token = await SecureStore.getItemAsync("token");
  const userToken = await SecureStore.getItemAsync("userToken");
  console.log("Stored token:", token?.substring(0, 50) + "...");
  console.log("Stored user:", userToken);
};
```

### 2. Clear Auth State (Reset)
```javascript
// Add a "Reset Auth" button for testing
const resetAuth = async () => {
  await SecureStore.deleteItemAsync("token");
  await SecureStore.deleteItemAsync("userToken");
  await SecureStore.deleteItemAsync("refresh_token");
  await SecureStore.deleteItemAsync("refresh_auth_token");
  console.log("Auth cleared");
};
```

### 3. Decode JWT Token
```javascript
// Check token claims
const token = await SecureStore.getItemAsync("token");
const parts = token.split(".");
const decoded = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
console.log("Token payload:", decoded);
```

## Common Issues & Fixes

### Issue: "No OTP sent after signup"
**Cause:** Cognito pool not configured for email/SMS verification
**Fix:** 
1. AWS Cognito Console → User Pools → Your Pool
2. Sign-up experience → Email/Phone verification
3. Enable email verification
4. Configure SES for production

### Issue: "Google login does nothing"
**Cause:** EXPO_PUBLIC_IDENTITY_GATEWAY_URL not set
**Fix:** Add to .env file

### Issue: "Can't navigate after login"
**Cause:** No auth gate redirecting to tabs
**Fix:** Already handled - router.replace("/(tabs)") in actions

### Issue: "Tokens not persisting"
**Cause:** SecureStore failing silently
**Fix:** Check device/emulator permissions; use AsyncStorage as fallback

## Network Testing

### 1. Monitor API Calls
Open Metro DevTools Network tab:
```
Filter: cognito-idp | your-api-domain
Watch for:
- SignUp calls (status 200)
- InitiateAuth calls (status 200)
- GetUser calls (status 200)
```

### 2. Verify Cognito Side
AWS Console → Cognito → Users:
- After signup: new user appears (UNCONFIRMED status)
- After login: lastLoginDate updates

## Automated Test Script (Optional)

Create a test helper:
```javascript
// utils/authTestHelper.js
export const runAuthTest = async () => {
  console.log("🧪 Starting Auth Test...");
  
  // 1. Check env
  console.log("Env check:", {
    hasPoolId: !!process.env.EXPO_PUBLIC_USER_POOL_ID,
    hasClientId: !!process.env.EXPO_PUBLIC_USER_POOL_WEB_CLIENT_ID,
  });
  
  // 2. Check stored tokens
  const token = await SecureStore.getItemAsync("token");
  console.log("Has token:", !!token);
  
  // 3. Test decode
  if (token) {
    try {
      const parts = token.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      console.log("Token valid:", {
        exp: new Date(payload.exp * 1000),
        email: payload.email,
      });
    } catch (e) {
      console.error("Token decode failed:", e);
    }
  }
};
```

## Next Steps After Testing

1. ✅ Verify Google OAuth URL is correct
2. ✅ Test end-to-end: Google login → Token stored → Tab navigation
3. ⚠️ Fix Cognito signup flow or disable it (use Google only)
4. 🔧 Add proper error handling for failed OAuth
5. 🔧 Add "Sign Out" functionality
6. 🔧 Add auth gate to prevent unauthenticated access to (tabs)
