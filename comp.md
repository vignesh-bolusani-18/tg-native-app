# Authentication & Company Management Flow Documentation

This document outlines the complete workflow for user authentication, token management, and company selection/creation in the TrueGradient application. This flow must be replicated in client applications (e.g., React Native) to ensure correct API communication.

## 🔄 High-Level Workflow

1.  **Login**: User logs in via Cognito (OTP).
2.  **Validate**: Backend validates the user and issues a `refreshToken`.
3.  **Exchange**: Client exchanges `refreshToken` for an `accessToken`.
4.  **Interact**: Client uses `accessToken` for all business logic (fetching companies, creating companies, etc.).

---

## 1. Authentication

### Step 1: Cognito Login (OTP)
*   **Action**: Perform standard AWS Cognito Custom Auth flow.
*   **Result**: Obtain the Cognito `idToken` (JWT).

### Step 2: Validate User
Validates the Cognito session with the backend and retrieves the long-lived refresh token.

*   **Endpoint**: `/validateUser/validate`
*   **Method**: `GET`
*   **Headers**:
    *   `Authorization`: `Bearer <Cognito_idToken>`
    *   `x-api-key`: `<Your_API_Key>`
*   **Response**:
    ```json
    {
      "isValidUser": true,
      "user": "<User_Info_Token>",
      "refreshToken": "<REFRESH_TOKEN>"
    }
    ```
*   **Action**: Securely store the `refreshToken`.

### Step 3: Get Access Token (Token Exchange)
Exchanges the refresh token for the actual access token required for API calls. **This is the most critical step.**

*   **Endpoint**: `/getAccessToken`
*   **Method**: `POST`
*   **Headers**:
    *   `x-api-key`: `<Your_API_Key>`
    *   `Content-Type`: `application/json`
*   **Body**:
    ```json
    {
      "refreshToken": "<REFRESH_TOKEN>"
    }
    ```
*   **Response**: Returns a string. This string is the **Access Token**.
*   **Action**: Store this as `accessToken`. **Use this token for all subsequent API calls.**

---

## 2. Company Management

### Step 4: Fetch Companies
Retrieves the list of companies associated with the user.

*   **Endpoint**: `/companies`
*   **Method**: `GET`
*   **Headers**:
    *   `Authorization`: `Bearer <accessToken>` (From Step 3)
    *   `x-api-key`: `<Your_API_Key>`
*   **Query Params**: `?t=<timestamp>&sendHash=true`
*   **Logic (Auto-Select)**:
    1.  Parse the response list.
    2.  **If list is empty**: Redirect user to **Create Company** screen.
    3.  **If list is not empty**:
        *   Sort list by `lastAccessed` timestamp (descending).
        *   Select the first company (index 0).
        *   Redirect user to the **Dashboard/Vibe** page for that company.

### Step 5: Create Company
Creates a new company. This requires a specific payload signing mechanism.

*   **Endpoint**: `/company`
*   **Method**: `POST`
*   **Headers**:
    *   `Authorization`: `Bearer <accessToken>`
    *   `x-api-key`: `<Your_API_Key>`
    *   `Content-Type`: `application/json`
*   **Payload Construction**:
    The backend does **not** accept raw JSON for company data. You must sign the data into a JWT.

    1.  **Prepare Data**:
        ```json
        {
          "companyName": "My New Company",
          "userID": "<User_ID>"
        }
        ```
    2.  **Sign Data**:
        *   **Algorithm**: `HS256`
        *   **Secret Key**: Use the `accessToken` (from Step 3) as the secret key.
        *   **Payload**: The data object from above.
    3.  **Final Request Body**:
        ```json
        {
          "companyDataToken": "<SIGNED_JWT_STRING>"
        }
        ```

---

## 🔑 Token Summary

| Token Name | Source | Usage |
| :--- | :--- | :--- |
| **Cognito ID Token** | AWS Cognito Login | Only used once to call `/validateUser`. |
| **Refresh Token** | `/validateUser` Response | Used to obtain a new Access Token via `/getAccessToken`. |
| **Access Token** | `/getAccessToken` Response | **The "Real" Token.** Used for Authorization header in all API calls (`/companies`, `/company`, etc.) and as the secret key for signing payloads. |

## ⚠️ Common Pitfalls
1.  **401 Unauthorized**: Usually means you are using the Cognito ID Token or Refresh Token in the `Authorization` header instead of the `accessToken`.
2.  **CORS / Network Error**: Often caused by missing or incorrect `x-api-key`.
3.  **400 Bad Request (Create Company)**: Usually means the `companyDataToken` was not signed correctly, or the wrong key (not the `accessToken`) was used to sign it.
