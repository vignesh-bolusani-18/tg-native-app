# 🚨 TROUBLESHOOTING GUIDE: 502 Errors on /experimentByCompany

## Quick Diagnosis

If you're still seeing 502 errors, follow this checklist:

### Step 1: Verify Environment Variables
```bash
# Check if EXPO_PUBLIC_API_KEY is set
grep EXPO_PUBLIC_API_KEY .env
```

✅ Expected output:
```
EXPO_PUBLIC_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
```

❌ If empty or missing:
```
# Fix: Add to .env
EXPO_PUBLIC_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
```

---

### Step 2: Check Console Logs
Run the app and look for these logs:

#### ✅ GOOD - Logs to look for:
```
LOG  🔍 [getAllExperiments] Making API request:
LOG     URL: https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?t=...&sendHash=true
LOG     Method: GET
LOG     Headers: {
LOG       'Content-Type': 'application/json',
LOG       'x-api-key': '***present***',  ← THIS IS KEY
LOG       'Authorization': 'Bearer eyJ...'
LOG     }
LOG     Response status: 200  ← Should be 200, not 502
LOG     Response ok: true
LOG  ✅ accessToken obtained!
LOG     accessToken: eyJhbGciOiJSUzI1NiI...
LOG     Token starts with 'ey': ✅ Valid JWT format
```

#### ❌ BAD - Signs of the bug:
```
WARN  [getAllExperiments] Response not OK: 502
WARN     Status: 502
WARN     Status Text: 
WARN     Error Body: {"message": "Internal server error"}

LOG     Headers: {
LOG       'x-api-key': '***missing***',  ← THIS IS THE PROBLEM!
LOG       'Authorization': undefined
LOG     }

LOG  Token starts with 'ey': ❌ Suspicious format  ← Token is corrupted!
```

---

## Detailed Troubleshooting

### Issue 1: x-api-key is Missing

**Symptoms:**
```
LOG  'x-api-key': '***missing***'
WARN Response not OK: 502
```

**Root Cause:**
```javascript
// OLD CODE (BROKEN)
'x-api-key': apiConfig.apiKey || ''  // Can become empty string!
```

**Solution:**
```javascript
// NEW CODE (FIXED)
const apiKey = apiConfig.apiKey;
if (!apiKey) {
  console.error('❌ CRITICAL: x-api-key is not set!');
  return { experiments: [] };
}
const headers = {
  'x-api-key': apiKey,  // Now guaranteed non-empty
};
```

**Actions:**
1. ✅ Already fixed in [utils/getExperiments.js](utils/getExperiments.js)
2. Verify EXPO_PUBLIC_API_KEY is in .env
3. Restart the app

---

### Issue 2: Token is Corrupted

**Symptoms:**
```
LOG  Token starts with 'ey': ❌ Suspicious format
LOG  accessToken: yJhbGciOiJSUzI1NiI...  ← Missing first char!
```

**Root Cause:**
```javascript
// OLD CODE (BROKEN)
const accessToken = rawAccessToken.replace(/^"+|"+$/g, "");
// If response is: "eyJhbGci..." 
// Result: "yJhbGci..." (REMOVES FIRST CHAR!)
```

**Solution:**
```javascript
// NEW CODE (FIXED)
let accessToken = rawAccessToken.trim();
if ((accessToken.startsWith('"') && accessToken.endsWith('"')) || 
    (accessToken.startsWith("'") && accessToken.endsWith("'"))) {
  accessToken = accessToken.slice(1, -1);  // Only outer quotes
}
```

**Actions:**
1. ✅ Already fixed in [utils/getAccessToken.js](utils/getAccessToken.js)
2. Check logs for: `Token starts with 'ey': ✅ Valid JWT format`
3. Restart the app

---

### Issue 3: Authorization Header is Missing

**Symptoms:**
```
LOG     'Authorization': undefined  ← Should show token!
WARN Response not OK: 502
```

**Root Cause:**
```javascript
// OLD CODE (CONDITIONAL)
...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
// If accessToken is null/undefined, header is omitted!
```

**Solution:**
```javascript
// NEW CODE (ALWAYS INCLUDE IF TOKEN EXISTS)
...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
// But now we validate accessToken earlier
```

**Actions:**
1. Check that `getAuthToken()` is returning a valid token
2. Add this debug log:
   ```javascript
   const accessToken = await getAuthToken();
   console.log('DEBUG: accessToken =', accessToken ? accessToken.substring(0, 50) + '...' : 'NULL');
   console.log('DEBUG: accessToken type:', typeof accessToken);
   console.log('DEBUG: accessToken is falsy:', !accessToken);
   ```
3. If accessToken is null, check `getAuthToken()` function
4. Restart the app

---

### Issue 4: Still Getting 502 After Fixes

If you've applied all fixes but still getting 502:

#### Check 1: Verify fixes were applied
```bash
# Check getExperiments.js has the fix
grep "if (!apiKey)" utils/getExperiments.js
# Should output: if (!apiKey) {

# Check getAccessToken.js has the fix
grep "slice(1, -1)" utils/getAccessToken.js
# Should output: accessToken = accessToken.slice(1, -1);
```

#### Check 2: Look for other 502 callers
The 502 might be from a different endpoint. Check the logs:
```
WARN  getConversationsByCompany: Failed to fetch conversations by company: 502
```

Multiple 502s suggest the issue is more general (missing auth or API key).

#### Check 3: Verify token payload
Add this debug code:
```javascript
const accessToken = await getAuthToken();

// Parse JWT without verification
const parts = accessToken.split('.');
if (parts.length === 3) {
  try {
    const payload = JSON.parse(atob(parts[1]));
    console.log('JWT Payload:', payload);
    console.log('Has company info:', payload.companyID || payload.company_id ? 'YES' : 'NO');
  } catch (e) {
    console.error('Failed to parse JWT:', e);
  }
}
```

Expected payload:
```javascript
{
  "iss": "...",
  "sub": "user-id",
  "email": "user@example.com",
  "companyID": "company-uuid",  // ← CRITICAL
  "exp": 1234567890
}
```

If `companyID` is missing, the backend can't extract it → 502.

#### Check 4: Verify API Key is correct
```bash
# Check what's in .env
grep EXPO_PUBLIC_API_KEY .env

# Should match the staging environment
# Expected: FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
```

#### Check 5: Monitor network requests
Use your browser's Network tab or Charles Proxy:

✅ Good request:
```
GET /experimentByCompany?t=1767677015532&sendHash=true HTTP/1.1
Host: api-staging-ap-south-1.truegradient.ai
x-api-key: FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
Authorization: Bearer eyJhbGciOiJSUzI1NiI...
Content-Type: application/json

Response: 200 OK
```

❌ Bad request:
```
GET /experimentByCompany?t=1767677015532&sendHash=true HTTP/1.1
Host: api-staging-ap-south-1.truegradient.ai
x-api-key: (empty or missing)
Authorization: (missing or malformed)
Content-Type: application/json

Response: 502 Bad Gateway
```

---

## Advanced Debugging

### Enable Full Request/Response Logging
Add to [utils/getExperiments.js](utils/getExperiments.js):

```javascript
export const getAllExperiments = async (companyID, retryCount = 0) => {
  try {
    // ... existing code ...
    
    console.log('=== FULL REQUEST DEBUG ===');
    console.log('URL:', url);
    console.log('Headers:', headers);
    console.log('Method: GET');
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    console.log('=== FULL RESPONSE DEBUG ===');
    console.log('Status:', response.status);
    console.log('StatusText:', response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error Body:', errorBody);
      console.error('Full Response:', response);
    }
    
    // ... rest of code ...
  }
};
```

### Test Token Exchange Directly
Create a test file to verify the token exchange:

```javascript
// test-token-exchange.js
import { getAccessToken } from './utils/getAccessToken';
import { getItem } from './utils/storage';

async function testTokenExchange() {
  try {
    console.log('=== TOKEN EXCHANGE TEST ===');
    
    // Get refresh token
    const refreshToken = await getItem('refresh_token_company');
    console.log('Refresh token:', refreshToken ? refreshToken.substring(0, 50) + '...' : 'NOT FOUND');
    
    if (!refreshToken) {
      console.error('❌ No refresh token found!');
      return;
    }
    
    // Exchange for access token
    console.log('Exchanging for access token...');
    const accessToken = await getAccessToken(refreshToken);
    console.log('Access token:', accessToken ? accessToken.substring(0, 50) + '...' : 'FAILED');
    
    // Parse the JWT
    const parts = accessToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
    }
    
    // Try the actual API call
    console.log('Testing API call...');
    const apiKey = 'FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib';
    const response = await fetch(
      'https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?t=' + Date.now() + '&sendHash=true',
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run it
testTokenExchange();
```

---

## Checking Backend Logs

If you have access to backend logs, look for:

### 🔴 Error Pattern: Invalid x-api-key
```
[GATEWAY] Request rejected - invalid x-api-key header
Status: 502 Bad Gateway
```

### 🔴 Error Pattern: Invalid JWT
```
[AUTH] Failed to verify JWT token
Token: yJhbGciOiJSUzI1NiI... (CORRUPTED)
Status: 502 Bad Gateway / Proxy Error
```

### 🔴 Error Pattern: Missing Company ID
```
[API] Cannot extract company ID from token
Token valid but no company claim
Status: 502 Bad Gateway / Internal Server Error
```

### 🟢 Good Pattern:
```
[GATEWAY] Request accepted
x-api-key: valid
JWT: valid
companyID: 25dcdeca-64c2-48e1-a8f0-e1eeb20d3d6d
Status: 200 OK
```

---

## Comparison Checklist

Use this to compare your mobile app with tg-application:

| Check | tg-app | Mobile | Status |
|-------|--------|--------|--------|
| HTTP library | axios | fetch | ⚠️ Different |
| x-api-key header | Always present | ✅ Now validated | ✅ FIXED |
| Token quote handling | No stripping | ✅ Safe stripping | ✅ FIXED |
| Authorization header | Always present | ⚠️ Conditional | ⚠️ Check logs |
| API Key value | Same | Same | ✅ OK |
| API Base URL | Same | Same | ✅ OK |
| Endpoint | Same | Same | ✅ OK |

---

## Post-Fix Verification

After applying all fixes:

1. ✅ `EXPO_PUBLIC_API_KEY` is set in .env
2. ✅ x-api-key validation is in place in getExperiments.js
3. ✅ Token quote stripping is safe in getAccessToken.js
4. ✅ Logs show: `'x-api-key': '***present***'`
5. ✅ Logs show: `Token starts with 'ey': ✅ Valid JWT format`
6. ✅ Response status is 200, not 502
7. ✅ Experiments array is populated

---

## If Still Not Working

Create a minimal test case:

```javascript
// Minimal test - paste in browser console
const apiKey = 'FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib';
const token = 'YOUR_JWT_TOKEN_HERE';

fetch('https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?t=' + Date.now() + '&sendHash=true', {
  method: 'GET',
  headers: {
    'x-api-key': apiKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then(r => { console.log('Status:', r.status); return r.json(); })
  .then(d => console.log('Data:', d))
  .catch(e => console.error('Error:', e));
```

If this works with a valid token, the issue is in how the mobile app obtains/formats the token.

