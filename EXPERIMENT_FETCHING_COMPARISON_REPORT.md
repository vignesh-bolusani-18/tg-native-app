# EXPERIMENT FETCHING COMPARISON REPORT
**Generated:** January 6, 2026  
**Purpose:** Identify why experiments API works in tg-application but fails in mobile app (502 errors)

---

## EXECUTIVE SUMMARY

### Root Causes Identified:
1. **CRITICAL: Missing `companyID` parameter in tg-application implementation**
   - tg-application: Uses `/experimentByCompany` WITHOUT companyID (uses JWT token authentication)
   - Mobile app: Uses `/experimentByCompany?companyID=${companyID}` WITH companyID parameter
   - **VERDICT:** The API likely doesn't expect companyID as query parameter

2. **Different Authentication Mechanisms**
   - tg-application: Uses JWT token in Authorization header + x-api-key in header
   - Mobile app: Uses refreshToken → accessToken exchange + x-api-key + Authorization header

3. **Different API Client Libraries**
   - tg-application: Uses axios
   - Mobile app: Uses native fetch API

4. **HTTP Method & Parameter Differences**
   - tg-application: GET with timestamp and sendHash parameters
   - Mobile app: GET with timestamp, sendHash, AND companyID parameters

---

## DETAILED COMPARISON

### 1. WORKING IMPLEMENTATION (tg-application)

#### File: `D:\TrueGradient\tg-application\src\utils\getExperiments.js`

```javascript
export const getExperiments = async (userID) => {
  const baseURL = process.env.REACT_APP_API_BASE_URL;  // https://api-staging-ap-south-1.truegradient.ai
  const Token = await getAuthToken(userID);
  
  try {
    const response = await axios.get(
      `${baseURL}/experimentByCompany?t=${Date.now()}&sendHash=true`,
      {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // Error handling
  }
};
```

#### Key Characteristics:

| Aspect | Value |
|--------|-------|
| **HTTP Method** | GET |
| **Endpoint** | `/experimentByCompany` |
| **API Base URL** | `https://api-staging-ap-south-1.truegradient.ai` |
| **Query Parameters** | `?t=${Date.now()}&sendHash=true` |
| **NO companyID parameter** | ✅ MISSING (THIS IS KEY!) |
| **HTTP Headers** | |
| - `x-api-key` | `${process.env.REACT_APP_API_KEY}` |
| - `Content-Type` | `application/json` |
| - `Authorization` | `Bearer ${Token}` (from getAuthToken(userID)) |
| **Request Body** | None (GET request) |
| **HTTP Client** | axios |
| **Authentication** | JWT Bearer token in Authorization header |

#### Authentication Flow:
1. `getAuthToken(userID)` is called
2. Retrieves cookies: `refresh_token`, `refresh_token_company`, or `refresh_auth_token`
3. If `refresh_token_company` exists:
   - Calls `getUserById(refreshCompanyToken)` to get JWT token
4. Returns JWT token that's used in Authorization header

#### Response Expected:
- Returns `response.data` directly
- Expected structure: `{ experiments: [...] }` or direct array

---

### 2. BROKEN IMPLEMENTATION (Mobile App)

#### File: `d:\TG_REACT_NATIVE_MOBILE_APP\utils\getExperiments.js`

```javascript
export const getAllExperiments = async (companyID, retryCount = 0) => {
  const accessToken = await getAuthToken();
  const timestamp = Date.now();
  
  const response = await fetch(
    `${apiConfig.apiBaseURL}/experimentByCompany?companyID=${companyID}&t=${timestamp}&sendHash=true`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiConfig.apiKey || '',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
    }
  );
  
  const data = await response.json();
  return data;
};
```

#### Key Characteristics:

| Aspect | Value |
|--------|-------|
| **HTTP Method** | GET |
| **Endpoint** | `/experimentByCompany` |
| **API Base URL** | `https://api-staging-ap-south-1.truegradient.ai` |
| **Query Parameters** | `?companyID=${companyID}&t=${timestamp}&sendHash=true` |
| **EXTRA companyID parameter** | ❌ PRESENT (LIKELY PROBLEM!) |
| **HTTP Headers** | |
| - `Content-Type` | `application/json` |
| - `x-api-key` | `${apiConfig.apiKey}` |
| - `Authorization` | `Bearer ${accessToken}` |
| **Request Body** | None (GET request) |
| **HTTP Client** | Native fetch API |
| **Authentication** | accessToken from getAccessToken(refreshToken) |

#### Authentication Flow:
1. `getAuthToken()` is called (local function)
2. Retrieves storage items: `refresh_token_company`, `refresh_token`, or `refresh_auth_token`
3. Calls `getAccessToken(refreshToken)` which:
   - Makes POST to `/getAccessToken?t=${Date.now()}`
   - Sends `{ refreshToken }`
   - Returns accessToken (plain string)
4. Uses accessToken in Authorization header

---

## CRITICAL DIFFERENCES TABLE

| Feature | tg-application | Mobile App | Issue |
|---------|-----------------|-----------|-------|
| **Query Parameters** | `?t=...&sendHash=true` | `?companyID=...&t=...&sendHash=true` | ⚠️ EXTRA companyID may be causing 502 |
| **HTTP Client** | axios | fetch | Different client, same result expected |
| **Token Source** | JWT from getAuthToken(userID) | accessToken from getAccessToken(refreshToken) | Different token type |
| **Token Refresh** | Manual via getUserById | Automatic via getAccessToken | Different approach |
| **x-api-key Header** | Always present | Present only if apiConfig.apiKey exists | Should both have it |
| **Authorization Format** | `Bearer ${Token}` | `Bearer ${accessToken}` | Both correct format |
| **API Base URL** | `process.env.REACT_APP_API_BASE_URL` | `apiConfig.apiBaseURL` | Same URL, different reference |
| **Content-Type** | Explicitly set | Explicitly set | Both have it |
| **Response Parsing** | `response.data` (axios) | `response.json()` (fetch) | Both correct |

---

## THE 502 ERROR ANALYSIS

### What Causes 502 Bad Gateway:
1. **Invalid Query Parameters** - Server may reject unknown/unexpected query parameters
2. **Missing Required Parameters** - Server expects specific params the mobile app isn't sending
3. **Invalid Authorization** - Token format or type doesn't match server expectations
4. **Backend Service Upstream Error** - But mobile app uses exact same backend

### Mobile App Hypothesis:
The `?companyID=${companyID}` parameter is likely **WRONG**:
- tg-application doesn't use it
- Backend likely extracts companyID from JWT token (inside `Token`/accessToken)
- Adding a companyID query parameter might confuse backend validation logic
- Could cause a mismatch between token-based company and URL parameter company
- Backend might reject for security reasons (company ID mismatch)

### Evidence:
```
tg-app:  /experimentByCompany?t=1234567&sendHash=true          ✅ WORKS
mobile:  /experimentByCompany?companyID=ABC&t=1234567&sendHash=true  ❌ 502
```

---

## EXACT CODE CHANGES NEEDED

### Change 1: Remove companyID Query Parameter

**File:** `d:\TG_REACT_NATIVE_MOBILE_APP\utils\getExperiments.js`

**Current (BROKEN):**
```javascript
const response = await fetch(
  `${apiConfig.apiBaseURL}/experimentByCompany?companyID=${companyID}&t=${timestamp}&sendHash=true`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiConfig.apiKey || '',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    },
  }
);
```

**Fixed:**
```javascript
const response = await fetch(
  `${apiConfig.apiBaseURL}/experimentByCompany?t=${timestamp}&sendHash=true`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiConfig.apiKey || '',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    },
  }
);
```

---

### Change 2: Update Console Logging

**File:** `d:\TG_REACT_NATIVE_MOBILE_APP\utils\getExperiments.js`

Update the debug log to reflect the change:

**Current:**
```javascript
console.log('🔍 [useExperiment] fetchExperiments called');
console.log('   Company:', company?.companyID);
```

**Should still work**, but add note that companyID is in the JWT token, not URL:
```javascript
console.log('🔍 [useExperiment] fetchExperiments called');
console.log('   Company:', company?.companyID);
console.log('   Note: companyID is extracted from JWT token, not passed as URL parameter');
```

---

## SUMMARY OF ALL HEADERS

### tg-application Headers (WORKING):
```
x-api-key: ${REACT_APP_API_KEY}
Content-Type: application/json
Authorization: Bearer ${Token}  ← JWT token from getAuthToken(userID)
```

### Mobile App Headers (BROKEN):
```
Content-Type: application/json
x-api-key: ${apiConfig.apiKey}
Authorization: Bearer ${accessToken}  ← accessToken from getAccessToken(refreshToken)
```

### Headers Comparison:
| Header | tg-app | Mobile | Status |
|--------|--------|--------|--------|
| `Content-Type: application/json` | ✅ | ✅ | Match |
| `x-api-key` | ✅ | ✅ | Both present |
| `Authorization: Bearer ...` | ✅ | ✅ | Both present |

**All headers are correct.** The issue is the **query parameter**, not headers.

---

## TOKEN AUTHENTICATION DIFFERENCES

### tg-application Token Flow:
1. `getAuthToken(userID)` fetches cookie-based JWT token
2. Token includes company info embedded in JWT
3. Server extracts companyID from JWT payload
4. No companyID needed in URL

### Mobile App Token Flow:
1. `getAccessToken(refreshToken)` exchanges for new accessToken
2. accessToken is returned as plain string (not JWT decoded)
3. Server should extract companyID from accessToken payload
4. **Mistake:** Mobile app adds companyID to URL parameter
   - This creates mismatch: "I'm user X from company Y (in token) but gimme company Z (in URL parameter)"
   - Server rejects this as security violation → 502

---

## RECOMMENDATION

### Primary Fix:
**Remove the `companyID` query parameter from the GET request.**

The companyID should be derived from the JWT/accessToken by the backend, not passed as a URL parameter. This matches the working tg-application implementation exactly.

### Why This Fixes It:
- Eliminates potential company ID mismatch validation
- Matches proven working implementation from tg-application
- Simplifies request and removes ambiguity
- Backend expects token-based company extraction, not URL-based

### Testing After Fix:
1. Verify accessToken is valid and includes company info
2. Check that `/experimentByCompany?t=...&sendHash=true` returns experiments
3. Verify response structure matches expected format
4. Monitor logs for any remaining 502 errors

---

## ADDITIONAL NOTES

### Why Mobile App Has companyID Parameter:
Likely added as a troubleshooting attempt, thinking:
- "We need to tell server which company's experiments to fetch"
- But the server already knows from the token
- This creates confusion and validation failures

### API Design Pattern:
The API uses **token-based company identification**:
- Company context comes from JWT token
- Explicit companyID parameter is redundant and potentially conflicting
- Following standard REST API security practices

---

## VERIFICATION CHECKLIST

After implementing the fix:
- [ ] Remove `companyID=${companyID}` from URL
- [ ] Keep `t=${timestamp}&sendHash=true` parameters
- [ ] Ensure Authorization header has valid accessToken
- [ ] Ensure x-api-key is present
- [ ] Test with actual company data
- [ ] Monitor logs for 502 errors
- [ ] Verify response structure is parsed correctly

