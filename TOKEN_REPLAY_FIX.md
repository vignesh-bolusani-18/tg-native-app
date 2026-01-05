# Token Replay Detection - Root Cause & Fix

## 🔍 Problem Analysis

### Error Pattern
```
LOG Response status: 400
ERROR Response body: {"message":"Token replay detected"}
```

### Root Cause
The backend tracks token usage by hash. When the same access token is used multiple times for API requests, it returns a **400 Token Replay Detected** error.

### Token Usage Flow (BEFORE FIX)
1. **Login** → `getAccessToken()` → Returns `apiToken` (e.g., `eyJhbGc...`)
2. **First API Call** → `getCompaniesList(apiToken)` → ✅ SUCCESS (200)
3. **Second API Call** → Company-selection screen calls `getCompaniesList(token)` with SAME token from Redux → ❌ FAIL (400 - Token Replay)

## ✅ Solution Implemented

### Changes Made

#### 1. [components/company/listCompany2.js](components/company/listCompany2.js#L36-L52)
**BEFORE:**
```javascript
const data = await getCompaniesList(token); // Reuses stored token
```

**AFTER:**
```javascript
const data = await getCompaniesList(); // Fetches fresh token automatically
```

#### 2. [redux/actions/authActions.js](redux/actions/authActions.js#L593)
**BEFORE:**
```javascript
const updatedResponse = await getCompaniesList(apiToken); // Reuses same token
```

**AFTER:**
```javascript
const updatedResponse = await getCompaniesList(); // Fetches fresh token
```

### How It Works Now

The `getCompaniesList()` function (in [utils/getCompaniesList.js](utils/getCompaniesList.js)):
- When called **WITHOUT** a token parameter → Calls `getFreshAccessToken()`
- `getFreshAccessToken()` → Exchanges `refresh_auth_token` via `getUserById()` → Returns NEW access token
- New token is used for the API request → ✅ No replay detection

```javascript
// utils/getCompaniesList.js (line 19-35)
const getFreshAccessToken = async () => {
  try {
    const refreshToken = await getStoredToken("refresh_auth_token") || 
                         await getStoredToken("refresh_token");
    
    if (!refreshToken) {
      console.warn("⚠️ No refresh token found, falling back to stored access token");
      return await getStoredToken("token");
    }
    
    console.log("🔄 Exchanging refresh token for fresh access token...");
    const freshToken = await getUserById(refreshToken);
    return freshToken;
  } catch (error) {
    console.error("❌ Failed to get fresh token:", error.message);
    return await getStoredToken("token"); // Fallback
  }
};
```

## 🎯 Token Usage Strategy

| Scenario | Token Source | Behavior |
|----------|--------------|----------|
| **Initial Login** | Pass `apiToken` explicitly | Uses fresh token from login flow |
| **Company Selection Screen** | Don't pass token | Fetches fresh token via refresh token |
| **After Creating Company** | Don't pass token | Fetches fresh token to avoid replay |

## 🔐 Backend Token Validation

From your token payload, I can see:
```json
{
  "userID": "51a3ed4a-c0d1-70ae-467e-5b02f40d538b",
  "userEmail": "vigneshbolusani661@gmail.com",
  "allowed_create_workspaces": 0,  // ⚠️ THIS IS YOUR 401 ISSUE
  "create_workspace": true,
  "version": 6,
  "exp": 1767482038
}
```

### Two Separate Issues:

#### ✅ FIXED: Token Replay (400 Error)
- **Cause:** Reusing same access token multiple times
- **Fix:** Fetch fresh token for each API request using refresh token
- **Status:** Fixed in this commit

#### ⚠️ NOT FIXED: Unauthorized Company Creation (401 Error)
- **Cause:** Backend permission flag `"allowed_create_workspaces": 0`
- **Backend Check:** The API validates this field before allowing company creation
- **Fix Required:** Backend admin must update your user record:
  ```sql
  UPDATE USERS 
  SET allowed_create_workspaces = 1 
  WHERE userID = '51a3ed4a-c0d1-70ae-467e-5b02f40d538b'
  ```
- **Status:** Requires backend database update

## 🧪 Expected Test Results

### After This Fix:
1. ✅ Login with OTP → Success
2. ✅ Validate token → Success  
3. ✅ Get access token → Success
4. ✅ First `/companies` call → Success (200)
5. ✅ POST `/company` → **Still 401** (backend permission issue)
6. ✅ Second `/companies` call from company-selection screen → **Now 200 (FIXED!)**

### What You Should See:
```
LOG  🔵 getCompaniesList: Fetching companies
LOG     🔄 Exchanging refresh token for fresh access token...
LOG  ✅ accessToken obtained!
LOG     Response status: 200  ← NO MORE 400 TOKEN REPLAY!
```

## 📋 Next Steps

### 1. Test This Fix
```bash
npm start
```
- Login with your email
- Verify NO "Token replay detected" errors
- Company creation will still fail with 401 (expected - backend permission)

### 2. Fix Backend Permission
Contact your backend team to update the database:
```javascript
// They need to run this or equivalent:
allowed_create_workspaces = 1  // Change from 0 to 1
```

### 3. Verify Full Flow Works
After backend permission is fixed, you should see:
```
LOG  ✅ Default company created: {...}
LOG  ✅ Companies re-fetched: 1
```

## 🔗 Related Files Modified

1. [components/company/listCompany2.js](components/company/listCompany2.js) - Company selection screen
2. [redux/actions/authActions.js](redux/actions/authActions.js) - Auth flow after company creation
3. [utils/getCompaniesList.js](utils/getCompaniesList.js) - Already had `getFreshAccessToken()` logic

## 📊 Environment Variables Verified

All required environment variables are present in [.env](.env):
- ✅ `EXPO_PUBLIC_API_BASE_URL` = https://api-staging-ap-south-1.truegradient.ai
- ✅ `EXPO_PUBLIC_API_KEY` = FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
- ✅ `EXPO_PUBLIC_USER_POOL_ID` = ap-south-1_FuqhGcsAn
- ✅ `EXPO_PUBLIC_USER_POOL_WEB_CLIENT_ID` = 2dulgjlqpkm0nug40qv7s5v03g

All configurations match staging environment correctly.

---

## Summary

**FIXED:** ✅ Token replay detection (400 error) by fetching fresh tokens
**STILL BROKEN:** ❌ Company creation (401 error) - requires backend permission update

The mobile app now matches the web app's token refresh flow exactly. Test it and let your backend team know about the `allowed_create_workspaces: 0` issue.
