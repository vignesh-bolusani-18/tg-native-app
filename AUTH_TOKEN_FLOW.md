# Authentication & Token Flow Guide

## Current Token Flow

### 1. Login (OTP Verification)
```
User enters email → Sends OTP → User enters OTP → Verify OTP
```

**Tokens Stored After Login:**
```javascript
SecureStore:
  - token: Cognito ID Token (JWT)
  - userToken: Cognito Access Token  
  - refresh_token: Cognito Refresh Token
  - refresh_auth_token: Backend refresh token (from /validateUser)

Redux:
  - auth.userData.token: Same as SecureStore "token"
  - auth.userInfo: { email, userID }
```

**Console Output After Login:**
```
💾 Storing tokens in SecureStore...
✅ Tokens stored in SecureStore!
  🔑 token: eyJraWQiOiJ...
  🔑 refresh_token: eyJjdHkiOiJKV1...
  🔑 refresh_auth_token: eyJhbGciOiJIUz...
✅ OTP Verified Successfully - Redux updated
📍 Next Step: Select a company to get refresh_token_company
```

### 2. Company Selection
```
User selects company → GET /companies → POST /getAuthToken → Store refresh_token_company
```

**Tokens Stored After Company Selection:**
```javascript
SecureStore:
  - refresh_token_company: Company-specific token (HIGHEST PRIORITY)
  
Redux:
  - auth.currentCompany: { id, name, ... }
```

**Console Output After Company Selection:**
```
🏢 Selecting company: My Company ID: abc-123-def
🔵 getRefreshToken: Getting company-specific refresh token
✅ Company refresh token received
✅ Stored refresh_token_company
✅ Company token retrieved: true
✅ Company selection complete - ready for API calls
```

### 3. API Calls (Conversations, etc.)
```
API call → getAuthToken() → Uses refresh_token_company → Makes request
```

**Token Priority in getAuthToken():**
```
1. refresh_token_company (HIGHEST - used after company selection)
2. token (main access token from login)
3. refresh_auth_token (backend refresh token)
4. refresh_token (Cognito refresh token)
```

**Console Output for API Calls:**
```
loadConversationList called
🔑 getAuthToken - Available tokens: {
  refresh_token_company: true,
  token: true,
  refresh_auth_token: true,
  refresh_token: true
}
✅ Using refresh_token_company
loadConversationListAction: Token available: true
loadConversationListAction: Token start: eyJhbGciOiJ...
loadConversationListAction: Attempting fetch by Company...
🔵 Fetching conversations from: https://api-staging-ap-south-1.truegradient.ai/conversationByCompany?t=...
🔵 Using API Key: ***t2Ib
```

## API Request Headers

All API requests to `EXPO_PUBLIC_API_BASE_URL` must include:

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer ${token}",  // From getAuthToken()
  "x-api-key": "${API_KEY}"           // From EXPO_PUBLIC_API_KEY
}
```

## Testing on Localhost vs Staging

### Localhost (Port 8081)
When running on `http://localhost:8081`:
- **CORS Issue**: Mobile app running on localhost trying to access staging API
- **Solution**: Backend must allow CORS from `http://localhost:8081` OR use staging URLs

### Staging
When deployed to staging:
- No CORS issues (same-origin or properly configured)
- All API calls work normally

### Current Error Analysis
```
Access to fetch at 'https://api-staging-ap-south-1.truegradient.ai/conversationByCompany'
from origin 'http://localhost:8081' has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header contains the invalid value ''.
```

**Problem**: Backend is returning empty `Access-Control-Allow-Origin` header
**Status**: 401 Unauthorized (token issue)

**Root Cause**: Either:
1. Token is not being sent correctly
2. Token is expired or invalid
3. Token doesn't have company context

## Debugging Steps

### Step 1: Verify Token Storage
```javascript
import { testTokenFlow } from './utils/testAuthFlow';
await testTokenFlow();
```

### Step 2: Check Console Logs After Login
Look for:
```
✅ Tokens stored in SecureStore!
  🔑 token: eyJraWQiOiJ...
```

### Step 3: Check Console Logs After Company Selection
Look for:
```
✅ Stored refresh_token_company
```

### Step 4: Check Console Logs Before API Call
Look for:
```
🔑 getAuthToken - Available tokens: {
  refresh_token_company: true,  ← MUST BE TRUE
  ...
}
✅ Using refresh_token_company
```

### Step 5: Check API Request Headers
In browser DevTools Network tab:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
```

## Complete Auth Flow Example

```javascript
// 1. LOGIN
const { requestOTP, verifyOTP } = useAuth();
await requestOTP('user@example.com');
await verifyOTP('123456');

// Console should show:
// ✅ Tokens stored in SecureStore!
// ✅ OTP Verified Successfully

// 2. SELECT COMPANY
const { getCompaniesList } = require('./utils/getCompaniesList');
const { getRefreshToken } = require('./utils/getRefreshToken');
const { setCurrentCompany } = useAuth();

const companies = await getCompaniesList();
await getRefreshToken(companies[0].id);
setCurrentCompany(companies[0]);

// Console should show:
// ✅ Stored refresh_token_company

// 3. MAKE API CALL
const { loadConversationListAction } = require('./redux/actions/vibeAction');
dispatch(loadConversationListAction(userInfo));

// Console should show:
// ✅ Using refresh_token_company
// 🔵 Fetching conversations from: https://...
// ✅ API call successful!
```

## Common Issues & Solutions

### Issue: "Token available: false"
**Solution**: User needs to login first
```javascript
await requestOTP(email);
await verifyOTP(otp);
```

### Issue: "401 Unauthorized" after login
**Solution**: User needs to select a company
```javascript
const companies = await getCompaniesList();
await getRefreshToken(companies[0].id);
setCurrentCompany(companies[0]);
```

### Issue: "refresh_token_company: false" in getAuthToken logs
**Solution**: Company selection didn't complete
- Check if `/getAuthToken` API call succeeded
- Verify `refresh_token_company` is stored in SecureStore

### Issue: CORS error from localhost
**Solution**: Backend needs to allow `http://localhost:8081` in CORS headers
OR test on actual device/emulator with staging URL

## Environment Variables Required

```bash
# .env file
EXPO_PUBLIC_API_BASE_URL=https://api-staging-ap-south-1.truegradient.ai
EXPO_PUBLIC_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
EXPO_PUBLIC_IDENTITY_GATEWAY_URL=https://identity-gateway-dev.truegradient.ai
EXPO_PUBLIC_VIBE_BASE_URL=vibe-gradient-api-staging-ap-south-1.truegradient.ai/api/v1

# Cognito
EXPO_PUBLIC_USER_POOL_ID=ap-south-1_FuqhGcsAn
EXPO_PUBLIC_USER_POOL_WEB_CLIENT_ID=2dulgjlqpkm0nug40qv7s5v03g
```

## What to Check in Backend (D:\TrueGradient\tg-application)

1. **CORS Configuration**: Allow `http://localhost:8081` for development
2. **Token Verification**: Check how tokens are verified in each endpoint
3. **Company Context**: Verify `/conversationByCompany` extracts companyID from token
4. **Headers Required**: Confirm what headers are mandatory for each endpoint

## Testing Checklist

- [ ] Can login with OTP
- [ ] Tokens stored in SecureStore after login
- [ ] Can fetch companies list
- [ ] Can select company
- [ ] `refresh_token_company` stored after company selection
- [ ] `getAuthToken()` returns `refresh_token_company`
- [ ] API calls include proper Authorization header
- [ ] API calls include x-api-key header
- [ ] Conversations load successfully
