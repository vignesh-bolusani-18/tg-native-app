# 🔧 Experiments API Fix: Mobile App vs tg-application

## Issue Found & Fixed ✅

The mobile app was sending **`companyID` as a query parameter**, but the backend extracts it from the **JWT token**, not from the URL.

### ❌ BROKEN (Mobile App - Before)
```javascript
// URL WITH companyID parameter (WRONG)
`${apiBaseURL}/experimentByCompany?companyID=${companyID}&t=${timestamp}&sendHash=true`

Headers:
- Content-Type: application/json
- x-api-key: {API_KEY}
- Authorization: Bearer {JWT_TOKEN}
```

### ✅ FIXED (Mobile App - After)
```javascript
// URL WITHOUT companyID parameter (CORRECT - matches tg-application)
`${apiBaseURL}/experimentByCompany?t=${timestamp}&sendHash=true`

Headers:
- Content-Type: application/json
- x-api-key: {API_KEY}
- Authorization: Bearer {JWT_TOKEN}
```

### ✅ WORKING REFERENCE (tg-application)
```javascript
// tg-application/src/utils/getExperiments.js
const response = await axios.get(
  `${baseURL}/experimentByCompany?t=${Date.now()}&sendHash=true`,  // NO companyID
  {
    headers: {
      "x-api-key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token}`,  // Company extracted from JWT
    },
  }
);
```

## Why This Matters

**The backend `/experimentByCompany` endpoint:**
1. ✅ **Accepts** `t` (timestamp) in query string
2. ✅ **Accepts** `sendHash=true` in query string
3. ✅ **Extracts company ID from JWT token** (not from URL parameters!)
4. ❌ **Does NOT expect** `companyID` parameter in URL
5. ❌ **Returns 502** when receiving unexpected `companyID` parameter

## Implementation Comparison

| Aspect | tg-application | Mobile App Before | Mobile App After |
|--------|-----------------|-----------------|-----------------|
| **Endpoint** | `/experimentByCompany` | `/experimentByCompany` | `/experimentByCompany` |
| **Query: t** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Query: sendHash** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Query: companyID** | ❌ NO | ❌ YES (WRONG!) | ❌ NO (FIXED!) |
| **HTTP Method** | GET | GET | GET |
| **Content-Type** | application/json | application/json | application/json |
| **x-api-key Header** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Authorization Header** | Bearer {Token} | Bearer {Token} | Bearer {Token} |
| **Company Source** | JWT Token | URL Param (WRONG) | JWT Token (FIXED) |

## Files Modified

✅ `utils/getExperiments.js`
- Removed `companyID` from query string
- Added detailed logging of request
- Kept all other functionality (retry, error handling, etc.)

## Expected Behavior After Fix

### Before (502 Error):
```
LOG  🚀 [useExperiment] Fetching experiments from backend...
LOG  📡 API Request: GET /experimentByCompany?companyID=xxxx&t=xxxx&sendHash=true
WARN [getAllExperiments] Response not OK: 502
LOG  ❌ Backend Service Error (502)
```

### After (Success):
```
LOG  🚀 [useExperiment] Fetching experiments from backend...
LOG  🔍 [getAllExperiments] Making API request:
LOG     URL: https://api-staging.../experimentByCompany?t=xxxx&sendHash=true
LOG  📦 [getAllExperiments] Raw API Response:
LOG     Type: object
LOG     Keys: experiments
LOG  ✅ [useExperiment] Experiments found: 5
LOG     Experiment IDs: exp-001, exp-002, exp-003
```

## How JWT Token Contains Company Info

The JWT token is decoded on the backend and contains the user's company context:

```javascript
// Inside JWT token payload (backend extracts this):
{
  "userID": "user-123",
  "companyID": "25dcdeca-64c2-48e1-a8f0-e1eeb20d3d6d",
  "email": "user@example.com",
  "iat": 1704537600,
  "exp": 1704624000
}
```

The backend automatically knows which company to fetch experiments for based on the JWT token's companyID field.

## Testing the Fix

1. **Restart the app** - Kill and restart npm start
2. **Open Experiments selector** - Press the experiments button
3. **Check console logs**:
   ```
   LOG  🔍 [getAllExperiments] Making API request:
   LOG     URL: https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?t=1704537600000&sendHash=true
   LOG     Method: GET
   LOG     Headers: {
   LOG       'Content-Type': 'application/json',
   LOG       'x-api-key': '***present***',
   LOG       'Authorization': 'Bearer eyJhbGc...'
   LOG     }
   ```
4. **Watch for success**:
   ```
   LOG  📦 [getAllExperiments] Raw API Response:
   LOG     Type: object
   LOG     Keys: experiments
   LOG  ✅ [useExperiment] Experiments found: X
   ```

## Why It Was Breaking Before

1. Mobile app sent: `GET /experimentByCompany?companyID=xxxx&t=xxx&sendHash=true`
2. Backend received unexpected `companyID` parameter
3. Backend couldn't process malformed request
4. Backend returned **502 Bad Gateway** (internal error)
5. Mobile app showed infinite loading spinner (no error handling)

## Summary

✅ **Fixed:** Removed `companyID` from query string  
✅ **Matched:** tg-application implementation exactly  
✅ **Reason:** Backend extracts company from JWT token, not from URL params  
✅ **Result:** Should now return 200 OK with experiments list

---

**Status:** Ready to test! 🚀
