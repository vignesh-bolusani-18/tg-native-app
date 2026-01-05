# TESTING CLARITY GUIDE

## THE PROBLEM

Your backend `/login/google` is redirecting to:
```
https://app.truegradient.ai/hello/agent/...
```

But should redirect to:
```
tgreactnativemobileapp://auth/oauth-callback#access_token=...&refresh_token=...
```

## WHERE TO TEST

### 1. WEB BROWSER (Chrome/Firefox on Desktop)
- URL: http://localhost:8082
- This is your React Native app running in web mode
- You'll see the SignUp/Login screens
- **Google OAuth will NOT work here** (redirects to web app)
- Use this for UI testing only

### 2. MOBILE DEVICE (Phone/Tablet)
- Scan QR code with Expo Go app
- This runs the actual React Native mobile app
- **Google OAuth should work here** (but backend needs fixing)
- Currently showing wrong screen (we're fixing this)

### 3. ANDROID EMULATOR
- Press `a` in Metro terminal
- Runs in Android emulator
- Same as mobile device testing

## BACKEND FIX NEEDED

Contact your backend team to update `/login/google` endpoint:

```javascript
// Current behavior (WRONG):
res.redirect('https://app.truegradient.ai/hello/agent/...')

// Should be (CORRECT):
const redirectUri = req.query.redirect_uri; // Get from query params
res.redirect(`${redirectUri}#access_token=${token}&refresh_token=${refreshToken}&refresh_auth_token=${authToken}`)
```

## HOW TO TEST NOW

### Step 1: Reload Mobile App
```
Press 'r' in Metro terminal
```

### Step 2: Check Console Logs
After reloading, you should see:
```
🔍 INDEX: Checking authentication...
📊 Stored Tokens: { hasToken: false, ... }
❌ NO TOKEN - Redirecting to /auth/signup
```

### Step 3: Try Google OAuth
1. Tap "Continue with Google"
2. Complete Google login
3. Watch Metro console for:
   ```
   🔵 Google OAuth: Opening URL: https://identity-gateway-dev.truegradient.ai/login/google?redirect_uri=tgreactnativemobileapp://...
   ```

### Step 4: Check Redirect
- ❌ **If browser stays on web page**: Backend ignoring redirect_uri
- ✅ **If app opens**: Backend working correctly!

## WHAT YOU'RE SEEING

Based on your logs, you successfully logged in but to the **WEB APP**, not mobile:
- Tokens are in **browser cookies** (web app)
- Need tokens in **SecureStore** (mobile app)

## TEMPORARY WORKAROUND (For Testing)

If you want to test the mobile app UI without fixing backend:

1. Manually copy tokens from browser console
2. We'll add a debug screen to manually input tokens
3. This lets you test the rest of the app

Would you like me to create this debug token input screen?
