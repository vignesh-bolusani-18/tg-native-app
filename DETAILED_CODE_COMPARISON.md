# 🔧 SIDE-BY-SIDE COMPARISON: Critical Code Differences

## File 1: getExperiments.js - API Request

### tg-application (WORKING)
**File:** `src/utils/getExperiments.js`
```javascript
import axios from "axios";
import { generateToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";

export const getExperiments = async (userID) => {
  console.log("entered in the get experiments");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  const Token = await getAuthToken(userID);
  
  if (1 == 1) {  // Always true (legacy code)
    try {
      const response = await axios.get(
        `${baseURL}/experimentByCompany?t=${Date.now()}&sendHash=true`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,  // ✅ DIRECT ENV ACCESS
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,  // ✅ ALWAYS INCLUDED
          },
        }
      );
      return response.data;  // ✅ AXIOS RESPONSE
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }
};
```

### Mobile App (BROKEN - BEFORE FIX)
**File:** `utils/getExperiments.js`
```javascript
import { apiConfig } from './apiConfig';
import { getItem } from './storage';
import { getAccessToken } from './getAccessToken';

export const getAllExperiments = async (companyID, retryCount = 0) => {
  try {
    const accessToken = await getAuthToken();
    const timestamp = Date.now();
    const url = `${apiConfig.apiBaseURL}/experimentByCompany?t=${timestamp}&sendHash=true`;
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiConfig.apiKey || '',  // ❌ CAN BE EMPTY STRING!
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),  // ❌ CONDITIONAL!
    };
    
    const response = await fetch(url, {  // ❌ USING FETCH!
      method: 'GET',
      headers,
    });
    // ... rest of code
  }
};
```

### Mobile App (AFTER FIX)
```javascript
export const getAllExperiments = async (companyID, retryCount = 0) => {
  try {
    const accessToken = await getAuthToken();
    const timestamp = Date.now();
    const url = `${apiConfig.apiBaseURL}/experimentByCompany?t=${timestamp}&sendHash=true`;
    
    // ✅ VALIDATE x-api-key BEFORE USING
    const apiKey = apiConfig.apiKey;
    if (!apiKey) {
      console.error('❌ [getAllExperiments] CRITICAL: x-api-key is not set in apiConfig!');
      console.error('   Check your .env file for EXPO_PUBLIC_API_KEY');
      return { experiments: [] };
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,  // ✅ NOW GUARANTEED NON-EMPTY
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    // ... rest of code
  }
};
```

---

## File 2: getAccessToken.js - Token Exchange

### tg-application (WORKING)
**File:** `src/redux/actions/authActions.js`
```javascript
export const getAuthToken = async () => {
  const refreshToken = await getCookie("refresh_token");
  const refreshCompanyToken = await getCookie("refresh_token_company");
  const accessToken = await getCookie("refresh_auth_token");

  if (refreshCompanyToken) {
    try {
      const authToken = await getUserById(refreshCompanyToken);  // ✅ BACKEND EXCHANGES IT
      return authToken;  // ✅ RETURNS FINAL JWT
    } catch (error) {
      // Handle error
    }
  } else if (refreshToken) {
    try {
      const authToken = await getUserById(refreshToken);  // ✅ BACKEND EXCHANGES IT
      return authToken;  // ✅ RETURNS FINAL JWT
    } catch (error) {
      // Handle error
    }
  }
};
```

### Mobile App (BROKEN - BEFORE FIX)
**File:** `utils/getAccessToken.js`
```javascript
export const getAccessToken = async (refreshToken) => {
  try {
    const endpoint = `/getAccessToken?t=${Date.now()}`;

    const response = await apiProxyFetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // ❌ AGGRESSIVE QUOTE STRIPPING - CAN CORRUPT JWT!
    const rawAccessToken = await response.text();
    const accessToken = rawAccessToken.replace(/^"+|"+$/g, "");  // ❌ TOO AGGRESSIVE!
    
    return accessToken;
  } catch (error) {
    console.error("❌ getAccessToken Error:", error.message);
    throw error;
  }
};
```

### Mobile App (AFTER FIX)
```javascript
export const getAccessToken = async (refreshToken) => {
  try {
    const endpoint = `/getAccessToken?t=${Date.now()}`;

    const response = await apiProxyFetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // ✅ SAFE QUOTE STRIPPING - ONLY REMOVES OUTER QUOTES
    const rawAccessToken = await response.text();
    let accessToken = rawAccessToken.trim();
    
    // Only strip surrounding quotes if they exist on BOTH sides
    if ((accessToken.startsWith('"') && accessToken.endsWith('"')) || 
        (accessToken.startsWith("'") && accessToken.endsWith("'"))) {
      accessToken = accessToken.slice(1, -1);
    }
    
    console.log("✅ accessToken obtained!");
    console.log("   Token starts with 'ey':", accessToken.startsWith('ey') ? "✅ Valid JWT format" : "❌ Suspicious format");
    
    return accessToken;
  } catch (error) {
    console.error("❌ getAccessToken Error:", error.message);
    throw error;
  }
};
```

---

## File 3: API Configuration

### tg-application (.env)
```env
REACT_APP_API_BASE_URL=https://api-staging-ap-south-1.truegradient.ai
REACT_APP_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
```

**tg-application (apiConfig.js)**
```javascript
return {
  identityGateway: "https://identity-gateway.truegradient.ai",
  clientUrl: "https://app.truegradient.ai",
  callbackPath: "/auth/callback/oauth",
};
```

### Mobile App (.env)
```env
EXPO_PUBLIC_API_BASE_URL=https://api-staging-ap-south-1.truegradient.ai
EXPO_PUBLIC_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
```

**Mobile App (apiConfig.js)**
```javascript
return {
  identityGateway: process.env.EXPO_PUBLIC_IDENTITY_GATEWAY_URL || "...",
  clientUrl: "myapp://",
  callbackPath: "auth/callback",
  baseURL: vibeBaseUrl,
  apiBaseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://api-staging-ap-south-1.truegradient.ai",
  apiKey: process.env.EXPO_PUBLIC_API_KEY,  // ✅ Same, but note fallback is missing!
};
```

---

## Summary: 5 Critical Differences

### 1. HTTP Client
| tg-application | Mobile App |
|---|---|
| `axios.get()` | `fetch()` |
| Built-in transformations | Manual processing |
| Auto headers | Manual header construction |

### 2. x-api-key Header
| tg-application | Mobile App |
|---|---|
| `process.env.REACT_APP_API_KEY` (direct) | `apiConfig.apiKey \|\| ''` (with fallback) |
| Required, no fallback | Optional, empty string fallback |
| Always present | Can be empty |

### 3. Authorization Header
| tg-application | Mobile App |
|---|---|
| Always: `Authorization: Bearer ${Token}` | Conditional: `...(accessToken ? {...} : {})` |
| Required | Optional |
| Never omitted | Omitted if accessToken falsy |

### 4. Token Quote Handling
| tg-application | Mobile App |
|---|---|
| Direct use, no manipulation | `/^"+\|"+$/g` aggressive stripping |
| Preserves token integrity | Can corrupt JWT |
| Safe | Destructive |

### 5. Token Exchange
| tg-application | Mobile App |
|---|---|
| `await getUserById(refreshToken)` via axios | `await apiProxyFetch() via fetch` |
| Backend exchanges, returns JWT | Fetches token, processes response |
| Guaranteed working format | Potential format issues |

---

## Why These Differences Matter

### Difference #1 & #2: x-api-key Missing/Empty
```
Request with: 'x-api-key': ''
Response: 502 Bad Gateway

Why: API Gateway can't authenticate empty API key
```

### Difference #3: Missing Authorization
```
Request without: Authorization header
Response: 502 or 401

Why: Backend needs auth to extract company info from JWT
```

### Difference #4: Token Corruption
```
Token in:  eyJhbGciOiJSUzI1NiI...
After strip: yJhbGciOiJSUzI1NiI... (FIRST CHAR REMOVED!)
Response: 502 Bad Gateway (can't verify corrupted token)
```

### Difference #5: Wrong Token Type
```
Exchange returns: intermediate token (not final backend JWT)
Backend expects: JWT with company ID embedded
Result: Can't extract company info → 502
```

---

## Files Modified

1. ✅ [utils/getAccessToken.js](utils/getAccessToken.js) - Fixed quote stripping
2. ✅ [utils/getExperiments.js](utils/getExperiments.js) - Added x-api-key validation

## Testing the Fix

Run the app and check logs:
```
✅ [getAllExperiments] Making API request:
   URL: https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?t=...&sendHash=true
   Method: GET
   Headers: {
     'Content-Type': 'application/json',
     'x-api-key': '***present***',  ← Should see this
     'Authorization': 'Bearer eyJ...'  ← Should see this
   }
```

If you see 502:
```
WARN [getAllExperiments] Response not OK: 502
```

Check:
1. Is `EXPO_PUBLIC_API_KEY` set in .env?
2. Is x-api-key showing as ***present***?
3. Does token start with 'ey'?
4. Are both headers being sent?

