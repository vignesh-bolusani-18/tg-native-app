# TrueGradient React Native App - Authentication Flow

## 🔐 Complete Authentication Workflow

### **Phase 1: OTP Login** (SignUpPage.js)
```
User enters email → initiateOtpLogin() → Cognito sends OTP
User enters 6-digit OTP → verifyOtpAndLogin()
```

### **Phase 2: Token Acquisition** (authActions.js - verifyOtpAndLogin)
```javascript
1. Cognito Custom Challenge Verification
   ↓ Returns: accessToken (JWT), refreshToken
   
2. Store Cognito Tokens
   localStorage (web) / SecureStore (native)
   - "token" = accessToken (JWT ID token)
   - "refresh_token" = Cognito refresh token
```

### **Phase 3: Backend User Registration** (CRITICAL - Currently Missing)
```javascript
3. Register User in Backend
   POST /user
   Headers: { Authorization: Bearer <accessToken> }
   Body: { userDataToken: <accessToken> }
   
   Backend validates Cognito token and creates user record
   ↓ Returns: User created in backend database
```

### **Phase 4: Token Validation** (authActions.js - verifyOtpAndLogin)
```javascript
4. Validate Token with Backend
   GET /validateUser
   Headers: { Authorization: Bearer <accessToken> }
   
   ↓ Returns: { 
       isValidUser: true, 
       user: <JWT with userID>, 
       refreshToken: <backend_refresh_token>
     }
   
5. Store Backend Refresh Token
   - "refresh_auth_token" = backend refresh token
```

### **Phase 5: Extract User Info** (jwtUtils.js - processToken)
```javascript
6. Decode JWT to Extract User Info
   token.split('.')[1] → Base64 decode → JSON parse
   
   ↓ Extract: { email, userID, name, sub }
   
7. Update Redux State
   dispatch(setUserInfo({ email, userID, name }))
   dispatch(setLoggedInUser({ email, token }))
   dispatch(setIsAuthenticated(true))
```

### **Phase 6: Company Fetching** (getCompaniesList.js)
```javascript
8. Fetch User's Companies
   GET /companies
   Headers: { Authorization: Bearer <accessToken> }
   
   ↓ Returns: { companies: [...] }
   
9. Store in Redux
   dispatch(loadCompanies(sortedCompanies))
```

### **Phase 7: Auto-Create Company** (IF companies.length === 0)
```javascript
10. Check if Companies Exist
    if (companies.length === 0) {
      
11. Create Default Company
    POST /company
    Headers: { Authorization: Bearer <accessToken> }
    Body: { 
      name: "User's Company", 
      companyName: "User's Company" 
    }
    
    ↓ Returns: { id, name, companyName, ... }
    
12. Re-fetch Companies
    GET /companies (again)
    }
```

### **Phase 8: Auto-Select Company** (authActions.js - verifyOtpAndLogin)
```javascript
13. Sort Companies by lastAccessed
    companies.sort((a, b) => b.lastAccessed - a.lastAccessed)
    
14. Select Most Recent Company
    const mostRecentCompany = sortedCompanies[0]
    
15. Get Company-Specific Refresh Token
    POST /getRefreshToken
    Headers: { Authorization: Bearer <refresh_auth_token> }
    Body: { companyID }
    
    ↓ Returns: { refreshToken: <company_refresh_token> }
    
16. Store Company Tokens
    - "refresh_token_company" = company refresh token
    - "companyID" = selected company ID
    
17. Update Redux
    dispatch(setCurrentCompany({
      id, name, companyName, role, lastAccessed
    }))
```

### **Phase 9: Navigation** (SignUpPage.js - handleOtpSubmit)
```javascript
18. Check Redux for Current Company
    const currentCompany = store.getState().auth.currentCompany
    
19. Navigate Based on Company Selection
    if (currentCompany && currentCompany.id) {
      router.replace("/vibe")  // Chatbot/Agent page
    } else {
      router.replace("/company-selection")  // Manual selection
    }
```

---

## 🔑 Token Usage Summary

### **Tokens Stored**:
1. **token** (Cognito JWT ID token)
   - Used for: All API calls (validateUser, companies, createCompany)
   - Format: JWT with { sub, email, cognito:username }

2. **refresh_token** (Cognito)
   - Used for: Refreshing Cognito session

3. **refresh_auth_token** (Backend)
   - Used for: Getting company refresh token
   - Obtained from: /validateUser response

4. **refresh_token_company** (Company-specific)
   - Used for: Vibe/Chatbot API calls
   - Obtained from: /getRefreshToken with companyID

5. **companyID**
   - Used for: Identifying selected company

### **Token Flow**:
```
Cognito OTP → accessToken (JWT)
              ↓
         /validateUser → refresh_auth_token
              ↓
       /getRefreshToken → refresh_token_company
              ↓
         Vibe API Calls
```

---

## 🏢 Company Auto-Creation Logic

### **When Companies are Auto-Created**:
1. After successful OTP verification
2. After backend user registration
3. When /companies returns empty array
4. Automatically creates one default company

### **Default Company Data**:
```javascript
{
  name: userInfo.name ? `${userInfo.name}'s Company` : "My Company",
  companyName: userInfo.name ? `${userInfo.name}'s Company` : "My Company"
}
```

---

## 🚀 App Entry Point Routing

### **app/index.tsx Logic**:
```javascript
1. Check if token exists in storage
   
2. If NO token:
   → router.replace('/auth/signup')
   
3. If token exists:
   a. Check Redux currentCompany
   b. Check refresh_token_company in storage
   
   If company selected:
   → router.replace('/vibe')
   
   If no company:
   → router.replace('/company-selection')
```

---

## ❌ Common Issues & Solutions

### **Issue 1: 401 Unauthorized when creating company**
**Cause**: User not registered in backend database
**Solution**: Call POST /user before creating company

### **Issue 2: CORS error on web**
**Cause**: Backend returning empty CORS header
**Solution**: Backend needs to allow localhost:8081, but frontend can't fix this

### **Issue 3: Mobile opening company page directly**
**Cause**: Old tokens in storage
**Solution**: Clear auth state on signup page entry

### **Issue 4: Companies not loading**
**Cause**: Token not being passed to API calls
**Solution**: Pass token explicitly from Redux

---

## 📝 Required Backend Endpoints

1. **POST /user** - Register user in backend
2. **GET /validateUser** - Validate Cognito token
3. **GET /companies** - Fetch user's companies
4. **POST /company** - Create new company
5. **POST /getRefreshToken** - Get company-specific token

---

## 🔄 State Management (Redux)

### **Auth Slice State**:
```javascript
{
  userInfo: { email, userID, name },
  userData: { email, token },
  isLoggedIn: boolean,
  isAuthenticated: boolean,
  companies_list: Array<Company>,
  currentCompany: Company | null,
  loading: boolean,
  error: string | null
}
```

### **Company Object Structure**:
```javascript
{
  id: string,
  companyID: string,
  name: string,
  companyName: string,
  role: string,
  lastAccessed: number
}
```

---

## 🧪 Testing Workflow

1. Clear all storage (localStorage/SecureStore)
2. Go to /auth/signup
3. Enter email → Receive OTP
4. Enter OTP → Should auto-create company
5. Should redirect to /vibe with company loaded
6. Redux should show currentCompany populated

---

## 🐛 Debug Checklist

- [ ] Token exists in storage?
- [ ] User registered in backend via POST /user?
- [ ] Token validated via /validateUser?
- [ ] Companies fetched via /companies?
- [ ] Company auto-created if none exist?
- [ ] Company refresh token obtained?
- [ ] Redux currentCompany set?
- [ ] Navigation to /vibe successful?
