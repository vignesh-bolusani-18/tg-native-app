# Detailed Authentication & Company Flow Documentation

This document provides a raw, step-by-step breakdown of the authentication and company selection flow for the TrueGradient application. It is designed to help developers replicate the logic in other clients (e.g., React Native) and debug issues.

## 1. Environment Configuration

To replicate the environment locally, you need the following keys.
**Note:** These are the *keys* used in the code. You must obtain the actual values from your team or the `.env` file in the web project.

| Key | Description | Usage |
| :--- | :--- | :--- |
| `REACT_APP_API_BASE_URL` | The base URL for the backend API. | All API calls. |
| `REACT_APP_API_KEY` | The `x-api-key` header value. | Required for all API calls. |
| `REACT_APP_COGNITO_USER_POOL_ID` | AWS Cognito User Pool ID. | Cognito SDK initialization. |
| `REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID` | AWS Cognito Client ID. | Cognito SDK initialization. |

### Local Proxy Configuration (Web Only)
The web app uses a proxy to avoid CORS issues during development (`localhost:3000`).
**File:** `src/setupProxy.js`
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/conversation', '/conversations', '/renameConversation', '/conversationByCompany', '/api'],
    createProxyMiddleware({
      target: 'https://api-staging-ap-south-1.truegradient.ai', // Example Target
      changeOrigin: true, // <--- CRITICAL: Changes the origin of the host header to the target URL
    })
  );
};
```
**Implication for React Native:**
*   **Native (iOS/Android):** CORS is usually not an issue. You can hit the API URL directly.
*   **Web (`localhost:8081`):** You **MUST** configure a similar proxy in your bundler (Metro/Webpack) or the backend will reject your request with a CORS error.

---

## 2. Authentication Flow (Step-by-Step)

### Step 1: Cognito Login (OTP)
**Function:** `initiateOtpLogin` & `verifyOtpAndLogin` (in `src/redux/actions/authActions.js`)

1.  **Initiate:** User enters email. App calls `initiateCustomAuth`.
2.  **Verify:** User enters OTP. App calls `verifyCustomChallenge`.
3.  **Result:** You get a **Cognito Session** containing an `idToken` (JWT).

### Step 2: Validate User & Get Refresh Token
**Function:** `validateUser` (in `src/utils/validateUser.js`)

*   **Endpoint:** `/validateUser/validate`
*   **Method:** `GET`
*   **Query Params:** `?t=<timestamp>`
*   **Headers:**
    *   `Authorization`: `Bearer <Cognito_idToken>` (from Step 1)
    *   `x-api-key`: `<REACT_APP_API_KEY>`
    *   `Content-Type`: `application/json`
*   **Response:**
    ```json
    {
      "isValidUser": true,
      "user": "<User_Info_Token>",
      "refreshToken": "<REFRESH_TOKEN>" // <--- SAVE THIS
    }
    ```
*   **Action:** Store `refreshToken` securely.

### Step 3: Exchange Refresh Token for Access Token
**Function:** `getUserById` (in `src/utils/getUserById.js`)
**Trigger:** This is called inside `getAuthToken` (in `authActions.js`) whenever an API call needs a token.

*   **Endpoint:** `/getAccessToken`
*   **Method:** `POST`
*   **Query Params:** `?t=<timestamp>`
*   **Headers:**
    *   `x-api-key`: `<REACT_APP_API_KEY>`
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer` (Empty string, or sometimes omitted)
*   **Body:**
    ```json
    {
      "refreshToken": "<REFRESH_TOKEN>" // From Step 2
    }
    ```
*   **Response:**
    ```text
    <ACCESS_TOKEN_STRING>
    ```
*   **Action:** This string is your **Access Token**. You **MUST** use this for all subsequent API calls.

---

## 3. Company Selection Flow

### Step 4: Fetch Companies
**Function:** `getCompaniesList` (in `src/utils/getCompaniesList.js`)

*   **Endpoint:** `/companies`
*   **Method:** `GET`
*   **Query Params:** `?t=<timestamp>&sendHash=true`
*   **Headers:**
    *   `Authorization`: `Bearer <ACCESS_TOKEN>` (From Step 3)
    *   `x-api-key`: `<REACT_APP_API_KEY>`
    *   `Content-Type`: `application/json`
*   **Response:** Array of company objects.

### Step 5: Auto-Select Logic
**Location:** `verifyOtpAndLogin` (in `src/redux/actions/authActions.js`)

1.  **Sort:** Sort the list by `lastAccessed` (descending).
2.  **Check:**
    *   **If List is Empty:** Redirect to Create Company page.
    *   **If List has Companies:**
        *   Pick the first company (index 0).
        *   Dispatch `setCurrCompany` action.
        *   **Redirect:** To `/<companyName>/agent/*` (or `scenario` if whitelisted).

### Step 6: Create Company (If needed)
**Function:** `createCompany` (in `src/utils/createCompany.js`)

*   **Endpoint:** `/company`
*   **Method:** `POST`
*   **Query Params:** `?t=<timestamp>`
*   **Headers:**
    *   `Authorization`: `Bearer <ACCESS_TOKEN>`
    *   `x-api-key`: `<REACT_APP_API_KEY>`
    *   `Content-Type`: `application/json`
*   **Body Construction (Critical):**
    The body is **NOT** raw JSON. It is a signed JWT.
    1.  **Payload:** `{ "companyName": "gt", "userID": "<userID>" }`
    2.  **Sign:** Use `jsrsasign` (or similar).
        *   **Algorithm:** `HS256`
        *   **Secret:** The `<ACCESS_TOKEN>` itself.
    3.  **Final Body:** `{ "companyDataToken": "<SIGNED_JWT>" }`

---

## 4. Routing & Redirection
**File:** `src/routes/index.js`

The app uses `react-router-dom` and protects routes based on `isAuthenticated` and `hasCompanySelected`.

*   **Root (`/`)**:
    *   If `isAuthenticated && hasCompanySelected`: Redirects to `/<companyName>/agent/*`.
    *   Else: Redirects to `/auth/login`.
*   **Auth (`/auth`)**:
    *   If `isAuthenticated`: Redirects to `/<companyName>/...` OR `/sso/listCompany` (if no company selected).
*   **SSO (`/sso`)**:
    *   Used for company selection (`/sso/listCompany`).
    *   Accessible only if `isAuthenticated` is true but `hasCompanySelected` is false.

**Redux State Updates:**
*   `isAuthenticated`: Set to `true` after successful OTP verification.
*   `userInfo`: Populated from the decoded `user` token (from Step 2).
*   `currentCompany`: Populated after auto-selection or manual selection.

## 5. Debugging Network Requests (Localhost)

To see these requests in your browser's Network tab while running locally:

1.  **Run Web App:** `npm start` (runs on port 3000).
2.  **Open DevTools:** F12 -> Network Tab.
3.  **Filter:** Filter by `XHR` or `Fetch`.
4.  **Login:** Perform the login flow.
5.  **Observe:**
    *   `validate`: Check the Response for `refreshToken`.
    *   `getAccessToken`: Check the Request Body (should have `refreshToken`) and Response (should be the Access Token).
    *   `companies`: Check the Authorization header (should be `Bearer <Access_Token>`).
