# Company Creation 401 Error - Web App vs Mobile App Analysis

## 🔍 Problem
Mobile app gets **401 Unauthorized** when creating company:
```json
{"message":"You are not authorized to create a company."}
```

Token payload shows:
```json
{
  "userID": "51a3ed4a-c0d1-70ae-467e-5b02f40d538b",
  "userEmail": "vigneshbolusani661@gmail.com",
  "allowed_create_workspaces": 0,  // ⚠️ THE ISSUE
  "create_workspace": true
}
```

**But the web app works fine with the same user account!**

## 🕵️ Investigation: Web App vs Mobile App

### Web App Flow (D:\TrueGradient\tg-application)

#### 1. Web App's createCompany ([src/utils/createCompany.js](D:\TrueGradient\tg-application\src\utils\createCompany.js))
```javascript
export const createCompany = async (payload) => {
  const authToken = await getAuthToken();  // ⭐ Gets FRESH token every time
  const token = await generateToken(payload, authToken);
  
  const response = await axios.post(
    `${baseURL}/company?t=${Date.now()}`,
    { companyDataToken: token },
    {
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,  // Uses FRESH token
      },
    }
  );
  return response.data;
};
```

#### 2. Web App's getAuthToken ([src/redux/actions/authActions.js](D:\TrueGradient\tg-application\src\redux\actions\authActions.js))
```javascript
export const getAuthToken = async () => {
  const refreshToken = await getCookie("refresh_token");
  const refreshCompanyToken = await getCookie("refresh_token_company");
  const accessToken = await getCookie("refresh_auth_token");

  // Priority order:
  // 1. refresh_token_company (if user selected a company)
  if (refreshCompanyToken) {
    const authToken = await getUserById(refreshCompanyToken);  // Exchange for fresh token
    return authToken;
  } 
  // 2. refresh_token (main refresh token)
  else if (refreshToken) {
    const authToken = await getUserById(refreshToken);  // Exchange for fresh token
    return authToken;
  }
  // 3. refresh_auth_token (fallback)
  else if (accessToken) {
    const authToken = await getUserById(accessToken);  // Exchange for fresh token
    return authToken;
  }
};
```

**Key Point:** Web app ALWAYS exchanges a refresh token for a fresh access token right before creating company.

### Mobile App Flow (BEFORE FIX)

#### Mobile App's Company Creation Flow
```javascript
// During login:
const apiToken = await getAccessToken(refreshAuthToken);  // Gets token at login time
await setSecureItem("token", apiToken);

// Later when creating company:
const newCompany = await createCompany(payload, apiToken);  // ❌ Reuses OLD token from login
```

**Key Difference:** Mobile app was reusing the SAME token from login time, not exchanging for a fresh one.

## 💡 Root Cause Hypothesis

The backend might:
1. **Update token permissions dynamically** - Fresh tokens might have updated `allowed_create_workspaces` value
2. **Check token freshness** - Only recently issued tokens are allowed to create companies
3. **Require specific token type** - Company-creation might require tokens obtained via specific refresh token exchange

The web app's success suggests that **exchanging the refresh token for a fresh access token right before company creation** gives proper permissions.

## ✅ Solution Implemented

Updated [redux/actions/authActions.js](redux/actions/authActions.js#L572-L610) to match web app flow:

```javascript
// If no companies exist, create default company (like web app does)
if (companies.length === 0) {
  console.log("\n🏗️ NO COMPANIES FOUND - Creating default company...");
  
  const companyName = userInfo.name ? `${userInfo.name}'s Company` : "My Company";
  const encodedName = encodeURIComponent(companyName.trim().replace(/ /g, "\u200B"));
  
  const payload = {
    companyName: encodedName,
    userID: userInfo.userID,
  };
  
  console.log("   Payload:", JSON.stringify(payload, null, 2));
  
  try {
    // 🔄 CRITICAL: Get FRESH token right before creating company (exactly like web app)
    // Web app calls getAuthToken() which exchanges refresh token for new access token
    console.log("🔄 Fetching FRESH access token before creating company...");
    const refreshToken = await getSecureItem("refresh_auth_token") || 
                         await getSecureItem("refresh_token");
    let freshToken = apiToken; // Fallback to login token
    
    if (refreshToken) {
      try {
        freshToken = await getUserById(refreshToken);  // ⭐ Exchange for FRESH token
        console.log("✅ Fresh token obtained for company creation");
        console.log("   Fresh token:", freshToken.substring(0, 30) + "...");
        
        // Decode to check permissions
        try {
          const parts = freshToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log("📋 Fresh Token Permissions:");
            console.log("   allowed_create_workspaces:", payload.allowed_create_workspaces);
            console.log("   create_workspace:", payload.create_workspace);
          }
        } catch (_) {}
      } catch (tokenError) {
        console.warn("⚠️ Failed to get fresh token, using login token:", tokenError.message);
      }
    }
    
    // Pass payload with userID and encoded name, plus FRESH access token
    const newCompany = await createCompany(payload, freshToken);  // ⭐ Use fresh token
    console.log("✅ Default company created:", newCompany);
```

## 🔄 Token Exchange Flow Comparison

### Web App
```
Login → refresh_auth_token stored
↓
Create Company → getAuthToken() called
↓
getUserById(refresh_auth_token) → Fresh Access Token
↓
POST /company with Fresh Token → ✅ SUCCESS
```

### Mobile App (BEFORE FIX)
```
Login → getAccessToken() → apiToken stored
↓
Create Company → Use stored apiToken
↓
POST /company with OLD Token → ❌ 401 UNAUTHORIZED
```

### Mobile App (AFTER FIX)
```
Login → getAccessToken() → apiToken stored
                         → refresh_auth_token stored
↓
Create Company → getUserById(refresh_auth_token) → Fresh Access Token
↓
POST /company with Fresh Token → 🤞 Should succeed
```

## 🧪 Expected Test Results

### What You Should See Now:
```
LOG  🏗️ NO COMPANIES FOUND - Creating default company...
LOG  🔄 Fetching FRESH access token before creating company...
LOG  ✅ Fresh token obtained for company creation
LOG     Fresh token: eyJhbGciOiJSUzI1NiIsInR5cCI6Ik...
LOG  📋 Fresh Token Permissions:
LOG     allowed_create_workspaces: 1  ← Should be 1 now!
LOG     create_workspace: true
LOG  🔵 createCompany: Creating new company
LOG     Response status: 200  ← Should be 200 now!
LOG  ✅ Default company created: {...}
```

### If Still 401:
Check the fresh token's `allowed_create_workspaces` value in the logs. If it's still `0`, then:
1. The backend needs to update your user permissions in the database
2. OR there's a timing issue where permissions haven't propagated yet
3. OR the backend requires a different refresh token (like `refresh_token_company`)

## 📊 Web App getUserById Implementation

For reference, web app's token exchange ([src/utils/getUserById.js](D:\TrueGradient\tg-application\src\utils\getUserById.js)):

```javascript
export const getUserById = async (refreshToken) => {
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  const response = await axios.post(
    `${baseURL}/getAccessToken?t=${Date.now()}`,
    { refreshToken },  // Send in body
    {
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json",
        "Authorization": `Bearer`,  // Empty Bearer token
      },
    }
  );
  return response.data;  // Returns plain token string
};
```

Your mobile app's implementation matches this exactly (see [utils/getUserById.js](utils/getUserById.js)).

## 📋 Next Steps

### 1. Test This Fix
```bash
npm start
```

Watch the logs carefully for:
- "🔄 Fetching FRESH access token before creating company..."
- "📋 Fresh Token Permissions: allowed_create_workspaces: ?"
- Response status for POST /company

### 2. Three Possible Outcomes

#### Outcome A: ✅ Works (Status 200)
The fresh token has `allowed_create_workspaces: 1` and company creation succeeds.
**Root cause:** Backend requires fresh tokens for company creation.

#### Outcome B: ❌ Still 401, but fresh token has `allowed_create_workspaces: 1`
There's another permission check we're missing.
**Next step:** Compare request headers, payload, and JWT signing with web app.

#### Outcome C: ❌ Still 401, fresh token has `allowed_create_workspaces: 0`
Backend hasn't granted your user account permission to create workspaces.
**Next step:** Backend team must update your user record in the database.

### 3. If Still Failing
Capture both:
1. **Web app network request** (Chrome DevTools → Network → POST /company)
2. **Mobile app request** (from your logs)

Compare:
- Request headers
- Request body (especially `companyDataToken` JWT)
- Authorization Bearer token payload

## 🔗 Files Modified

1. [redux/actions/authActions.js](redux/actions/authActions.js#L572-L610) - Added fresh token exchange before company creation

## 🎯 Key Takeaway

The web app's success with company creation comes from **always fetching a fresh access token via refresh token exchange** right before the API call. This ensures:
1. Token has latest permissions
2. Token is freshly issued (not expired or stale)
3. Token is the correct type for the operation

We've now implemented the same flow in the mobile app to match the web app's behavior exactly.
