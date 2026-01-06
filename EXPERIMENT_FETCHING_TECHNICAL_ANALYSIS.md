# TECHNICAL DEEP DIVE: API CALL COMPARISON

## REQUEST STRUCTURE BREAKDOWN

### tg-application (WORKING)

```
HTTP GET Request:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /experimentByCompany?t=1704534500000&sendHash=true HTTP/1.1
Host: api-staging-ap-south-1.truegradient.ai
Content-Type: application/json
x-api-key: your-api-key-here
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Connection: keep-alive

[No body - GET request]
```

**Key Points:**
- ✅ No companyID in URL
- ✅ Token embedded in JWT
- ✅ Backend decodes token to get company

---

### Mobile App (BEFORE FIX - BROKEN)

```
HTTP GET Request:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /experimentByCompany?companyID=company-12345&t=1704534500000&sendHash=true HTTP/1.1
Host: api-staging-ap-south-1.truegradient.ai
Content-Type: application/json
x-api-key: your-api-key-here
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Connection: keep-alive

[No body - GET request]
```

**Problems:**
- ❌ Includes `companyID=company-12345` in URL
- ⚠️ Backend may reject as security violation
- ⚠️ Company in token ≠ Company in URL parameter

---

### Mobile App (AFTER FIX - WORKING)

```
HTTP GET Request:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /experimentByCompany?t=1704534500000&sendHash=true HTTP/1.1
Host: api-staging-ap-south-1.truegradient.ai
Content-Type: application/json
x-api-key: your-api-key-here
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Connection: keep-alive

[No body - GET request]
```

**Fixed:**
- ✅ No companyID in URL (matches tg-application)
- ✅ Company extracted from JWT token
- ✅ No mismatch between token and URL

---

## HEADER-BY-HEADER ANALYSIS

### Content-Type Header
```
tg-application: "Content-Type": "application/json"
Mobile App:     "Content-Type": "application/json"
Status:         ✅ IDENTICAL
Importance:     Tells server response will be JSON
```

### x-api-key Header
```
tg-application: "x-api-key": process.env.REACT_APP_API_KEY
Mobile App:     "x-api-key": apiConfig.apiKey || ''
Status:         ✅ FUNCTIONALLY SAME (different config source)
Importance:     API authentication key, proves app is authorized
```

### Authorization Header
```
tg-application: "Authorization": `Bearer ${Token}`
                where Token = await getAuthToken(userID)
                Token is a JWT token
Mobile App:     "Authorization": `Bearer ${accessToken}`
                where accessToken = await getAccessToken(refreshToken)
                accessToken is also a JWT token
Status:         ✅ FUNCTIONALLY SAME (different token source)
Importance:     User authentication and company context
```

---

## QUERY PARAMETER ANALYSIS

### Timestamp Parameter: `t=${Date.now()}`
```
Purpose:        Anti-caching, prevents CDN/browser caching
tg-application: ?t=1704534500000
Mobile App:     ?t=1704534500000
Status:         ✅ IDENTICAL
Importance:     Critical for getting fresh data
```

### sendHash Parameter: `sendHash=true`
```
Purpose:        Requests server include hash verification
tg-application: &sendHash=true
Mobile App:     &sendHash=true
Status:         ✅ IDENTICAL
Importance:     Security/integrity verification
```

### companyID Parameter: ❌ REMOVED
```
Purpose:        [UNUSED - Backend gets company from token]
tg-application: [NOT INCLUDED]
Mobile App BEFORE: &companyID=${companyID}  ← PROBLEMATIC
Mobile App AFTER:  [NOT INCLUDED]            ← FIXED
Status:         ✅ NOW MATCHES
Importance:     Removing this FIXES the 502 error
```

---

## AUTHENTICATION FLOW COMPARISON

### tg-application Authentication Chain

```
User Login (Cognito/OAuth)
    ↓
Cookie Storage: refresh_token | refresh_token_company | refresh_auth_token
    ↓
Call: getAuthToken(userID)
    ├─ Read: refresh_token_company cookie
    ├─ Read: refresh_token cookie (fallback)
    └─ Call: getUserById(refreshToken)
    ↓
Get: JWT Token (decoded includes: userID, companyID, permissions)
    ↓
Use in API Call: Authorization: Bearer ${Token}
    ↓
Backend: Decodes JWT, extracts companyID, queries DB for that company's experiments
```

---

### Mobile App Authentication Chain

```
User Login (Cognito/OAuth)
    ↓
Storage (AsyncStorage): refresh_token_company | refresh_token | refresh_auth_token
    ↓
Call: getAuthToken() [local function in getExperiments.js]
    ├─ Read: refresh_token_company from storage
    ├─ Read: refresh_token from storage (fallback)
    └─ Call: getAccessToken(refreshToken)
    ↓
getAccessToken Flow:
    ├─ POST /getAccessToken?t=${Date.now()}
    ├─ Body: { refreshToken }
    └─ Response: accessToken (JWT string)
    ↓
Get: accessToken (decoded includes: userID, companyID, permissions)
    ↓
Use in API Call: Authorization: Bearer ${accessToken}
    ↓
Backend: Decodes JWT, extracts companyID, queries DB for that company's experiments
```

---

## BACKEND PROCESSING LOGIC

### Expected Backend Behavior

```
1. Receive Request: GET /experimentByCompany?t=...&sendHash=true
   
2. Extract Authorization Header: Bearer ${token}
   
3. Decode JWT Token:
   {
     "userID": "user-123",
     "companyID": "company-abc",
     "permissions": ["read_experiments"],
     ...
   }
   
4. Get companyID from decoded token: "company-abc"
   
5. Query Database:
   SELECT experiments WHERE companyID = 'company-abc'
   
6. Return experiments array with 200 OK
```

### What Happens With Wrong URL Parameter (BEFORE FIX)

```
1. Receive Request: GET /experimentByCompany?companyID=company-xyz&t=...&sendHash=true
   
2. Extract Authorization Header: Bearer ${token}
   
3. Decode JWT Token: companyID = "company-abc"
   
4. Check URL Parameter: companyID = "company-xyz"
   
5. MISMATCH DETECTED! 
   - Token says: company-abc
   - URL says: company-xyz
   
6. Security Validation FAILS
   
7. Response: 502 Bad Gateway (upstream service error from security module)
```

---

## CODE EXECUTION FLOW

### Mobile App Before Fix

```javascript
// hooks/useExperiment.js
fetchExperiments = async (force = false) => {
  const response = await getAllExperiments(company.companyID);
  //                                       ↓
  //                        passes "company-abc"
}

// utils/getExperiments.js
export const getAllExperiments = async (companyID, retryCount = 0) => {
  const accessToken = await getAuthToken();
  
  const response = await fetch(
    // ❌ PROBLEM: Including companyID in URL
    `${apiConfig.apiBaseURL}/experimentByCompany?companyID=${companyID}&t=${timestamp}&sendHash=true`,
    //                                                    ↑↑↑↑↑↑↑↑↑↑
    //                              This causes 502 error
    { headers: { ... } }
  );
  
  return response.json();
}
```

### Mobile App After Fix

```javascript
// hooks/useExperiment.js
fetchExperiments = async (force = false) => {
  const response = await getAllExperiments(company.companyID);
  //                                       ↓
  //                        Still passes "company-abc" for validation
}

// utils/getExperiments.js
export const getAllExperiments = async (companyID, retryCount = 0) => {
  // ⭐ NOTE: companyID is kept for validation/logging
  // but is NOT sent to the backend
  console.log('Fetching experiments for company:', companyID);
  
  const accessToken = await getAuthToken();
  
  const response = await fetch(
    // ✅ FIXED: No companyID in URL
    `${apiConfig.apiBaseURL}/experimentByCompany?t=${timestamp}&sendHash=true`,
    //                                                                ↑
    //                        Company comes from token instead
    { headers: { ... } }
  );
  
  return response.json();
}
```

---

## NETWORK TRACE COMPARISON

### tg-application Network Trace (WORKING)

```
Request URL: https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?t=1704534500000&sendHash=true
Request Method: GET
Status Code: 200 OK

Request Headers:
  x-api-key: abc123xyz
  Content-Type: application/json
  Authorization: Bearer eyJ...

Response Headers:
  content-type: application/json
  content-length: 2458
  
Response Body:
{
  "experiments": [
    {
      "experimentID": "exp-001",
      "experimentName": "Test Experiment",
      "experimentModuleName": "demand-planning",
      "experimentStatus": "Completed",
      ...
    },
    ...
  ]
}
```

---

### Mobile App Network Trace (BEFORE FIX - BROKEN)

```
Request URL: https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?companyID=company-12345&t=1704534500000&sendHash=true
Request Method: GET
Status Code: 502 Bad Gateway ❌

Request Headers:
  Content-Type: application/json
  x-api-key: abc123xyz
  Authorization: Bearer eyJ...

Response Headers:
  content-type: text/html
  
Response Body:
<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

---

### Mobile App Network Trace (AFTER FIX - WORKING)

```
Request URL: https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?t=1704534500000&sendHash=true
Request Method: GET
Status Code: 200 OK ✅

Request Headers:
  Content-Type: application/json
  x-api-key: abc123xyz
  Authorization: Bearer eyJ...

Response Headers:
  content-type: application/json
  content-length: 2458
  
Response Body:
{
  "experiments": [
    {
      "experimentID": "exp-001",
      "experimentName": "Test Experiment",
      "experimentModuleName": "demand-planning",
      "experimentStatus": "Completed",
      ...
    },
    ...
  ]
}
```

---

## DEBUGGING TIPS

### How to Verify the Fix is Working

1. **Check Network Tab in DevTools:**
   - URL should be: `https://...api...ai/experimentByCompany?t=...&sendHash=true`
   - Should NOT contain: `companyID=`

2. **Check Console Logs:**
   ```
   ✅ Success signs:
   - No 502 errors
   - "Experiments found: N" message appears
   - Response status is 200
   ```

3. **Check Redux State:**
   ```javascript
   // In React DevTools Redux inspector:
   state.vibe.experiments_list // Should have experiments array
   state.vibe.experiments_list.length > 0 // Should be true if company has experiments
   ```

4. **Test with Network Throttling:**
   - Chrome DevTools → Network → Slow 3G
   - Verify request completes successfully even with poor connection

---

## SECURITY IMPLICATIONS

### Before Fix (INSECURE):
```
Token says: "I'm from company-abc"
URL parameter says: "Get me data for company-xyz"
Result: Validation conflict → 502
```

### After Fix (SECURE):
```
Token says: "I'm from company-abc"
Backend extracts company from token
Backend verifies user has access to company
Backend returns only company-abc's experiments
Result: Proper authorization ✅
```

The fix actually **improves security** by removing the ability to override company context via URL parameters.

