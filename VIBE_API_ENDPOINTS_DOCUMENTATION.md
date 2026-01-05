# Vibe/Agent API Endpoints Documentation

## Environment Variables Reference

Based on the codebase analysis, here are all the environment variables and endpoints used for the Vibe/Agent functionality:

---

## 1. **Identity & Auth Service**

### Base URL Configuration
- **Environment Variable**: `REACT_APP_IDENTITY_GATEWAY_URL`
- **Local Development**: `http://localhost:8080`
- **Staging**: `https://identity-gateway-dev.truegradient.ai`
- **Production**: `https://identity-gateway.truegradient.ai`

### Endpoints2

#### POST `/login`
**Purpose**: Send OTP to user's email  
**Used In**: [src/utils/apiConfig.js](src/utils/apiConfig.js)  
**Request Body**:
```json
{
  "email": "user@example.com"
}
```

#### POST `/login/verify`
**Purpose**: Verify OTP and get access token  
**Used In**: [src/utils/apiConfig.js](src/utils/apiConfig.js)  
**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### GET `/login/google`
**Purpose**: Initiate Google OAuth flow  
**Used In**: [src/utils/apiConfig.js](src/utils/apiConfig.js)

#### POST `/exchange-token`
**Purpose**: Exchange Identity Gateway token for backend token  
**Used In**: [src/pages/auth/callback/root-callback.js](src/pages/auth/callback/root-callback.js)  
**Headers**: `Authorization: Bearer {accessToken}`  
**Request Body**:
```json
{
  "token": "accessToken",
  "refreshToken": "refreshToken",
  "refreshAuthToken": "refreshAuthToken",
  "userData": {}
}
```

#### GET `/health`
**Purpose**: Health check endpoint  
**Used In**: [src/utils/apiConfig.js](src/utils/apiConfig.js)

---

## 2. **Vibe Backend (Chat & Logic)**

### Base URL Configuration
- **Environment Variable**: `REACT_APP_VIBE_BASE_URL`
- **Build Args**: Set in Dockerfile and CI/CD workflows
- **Staging**: `VIBE_BASE_URL_STAGING_AP_SOUTH_1` (GitHub Secrets)
- **Production US-EAST-1**: `VIBE_BASE_URL_PROD_US_EAST_1` (GitHub Secrets)
- **Production AP-SOUTH-1**: `VIBE_BASE_URL_PROD_AP_SOUTH_1` (GitHub Secrets)

### Common Headers for All Endpoints
```javascript
{
  "x-api-key": process.env.REACT_APP_API_KEY,
  "Content-Type": "application/json",
  "Authorization": "Bearer {Token}"
}
```

### Endpoints

#### POST `/generate-token`
**Purpose**: Generate JWT token for WebSocket authentication  
**Used In**: [src/hooks/useWorkflowWebSocket.js](src/hooks/useWorkflowWebSocket.js)  
**Query Parameters**:
- `user_id`: User ID
- `company_id`: Company ID
- `expires_hours`: Token expiration (default: 24)

**Response**:
```json
{
  "access_token": "jwt-token-string"
}
```

---

## 3. **Main Backend API (REACT_APP_API_BASE_URL)**

### Base URL Configuration
- **Environment Variable**: `REACT_APP_API_BASE_URL`
- **Staging**: `REACT_APP_API_BASE_URL` (GitHub Secrets)
- **Production US-EAST-1**: `PROD_US_EAST_1_REACT_APP_API_BASE_URL` (GitHub Secrets)
- **Production AP-SOUTH-1**: `PROD_AP_SOUTH_1_REACT_APP_API_BASE_URL` (GitHub Secrets)

### Conversation Management Endpoints

#### POST `/conversation`
**Purpose**: Create a new conversation  
**Used In**: [src/utils/conversations.js](src/utils/conversations.js)  
**Request Body**:
```json
{
  "conversationDataToken": "jwt-token-with-conversation-data"
}
```

**Token Payload**:
```javascript
{
  conversationID: "uuid",
  userID: "user-id",
  companyID: "company-id",
  createdAt: 1234567890,  // Unix timestamp
  updatedAt: 1234567890,  // Unix timestamp
  messageCount: 0,
  workflowsUsed: [],
  experiments: {},
  conversation_name: "New Chat"
}
```

#### POST `/conversation/get`
**Purpose**: Get conversation by ID  
**Used In**: [src/utils/conversations.js](src/utils/conversations.js)  
**Request Body**:
```json
{
  "conversationByIdToken": "jwt-token-with-conversation-id"
}
```

#### DELETE `/conversation`
**Purpose**: Delete a conversation  
**Used In**: [src/utils/conversations.js](src/utils/conversations.js)  
**Query Parameters**: `deleteConversationToken={jwt-token}&t={timestamp}`

#### POST `/renameConversation`
**Purpose**: Rename/update conversation title  
**Used In**: [src/utils/conversations.js](src/utils/conversations.js)  
**Request Body**:
```json
{
  "conversationDataToken": "jwt-token-with-updated-data"
}
```

#### GET `/conversations/any`
**Purpose**: Get all conversations  
**Used In**: [src/utils/conversations.js](src/utils/conversations.js)

#### GET `/conversationByCompany`
**Purpose**: Get conversations by company  
**Used In**: [src/utils/conversations.js](src/utils/conversations.js)  
**Query Parameters**: `t={timestamp}&sendHash=true`

#### GET `/conversationByUser`
**Purpose**: Get conversations by user  
**Used In**: [src/utils/conversations.js](src/utils/conversations.js)  
**Query Parameters**: `t={timestamp}`

### Credits Management Endpoints

#### GET `/credits`
**Purpose**: Get current credit score/balance  
**Used In**: [src/utils/getAndUpdateCredits.js](src/utils/getAndUpdateCredits.js)  
**Query Parameters**: `t={timestamp}`

**Response**:
```json
{
  "credits": 100
}
```

#### POST `/credits`
**Purpose**: Update credit score (increment/decrement)  
**Used In**: [src/utils/getAndUpdateCredits.js](src/utils/getAndUpdateCredits.js)  
**Request Body**:
```json
{
  "updateCreditsToken": "jwt-token-with-credit-update"
}
```

**Token Payload**:
```javascript
{
  action: "increment" | "decrement",
  value: 1
}
```

### Experiment Management Endpoints

#### GET `/experimentByCompany`
**Purpose**: Get all experiments for a company  
**Used In**: [src/utils/getExperiments.js](src/utils/getExperiments.js)  
**Query Parameters**: `t={timestamp}&sendHash=true`

---

## 4. **WebSocket (Real-time Chat)**

### WebSocket URL Configuration
- **Environment Variable**: `REACT_APP_VIBE_BASE_URL`
- **Protocol**: `ws://` (local) or `wss://` (production)
- **Path**: `/workflows/stream/{workflowName}`

### WebSocket Connection

#### URL Format
```
wss://{REACT_APP_VIBE_BASE_URL}/workflows/stream/{workflowName}?token={jwt-token}
```

**Example**:
```
wss://vibe-backend.truegradient.ai/workflows/stream/tg_workflow?token=eyJhbGc...
```

#### Used In
- [src/hooks/useWorkflowWebSocket.js](src/hooks/useWorkflowWebSocket.js)
- [src/utils/websocketConfig.js](src/utils/websocketConfig.js)

#### Configuration Constants
```javascript
export const CONNECTION_CONFIG = {
  RECONNECT_ATTEMPTS: 10,
  RECONNECT_INTERVAL: 2000,      // 2 seconds
  HEARTBEAT_INTERVAL: 30000,     // 30 seconds
  NORMAL_CLOSURE_CODE: 1000,
  MAX_MESSAGE_SIZE: 65536,       // 64KB
};
```

#### Message Types
```javascript
export const MESSAGE_TYPES = {
  AI_UNDERSTANDING: "ai_understanding",
  TOOL_CALL: "tool_call",
  TOOL_RESULT: "tool_result",
  FINAL_RESULT: "final_result",
  FINAL_ANSWER: "final_answer",
  ERROR: "error",
};
```

#### WebSocket Message Format (Outgoing)
```json
{
  "query": "user query text",
  "conversation_path": "accounts/{companyName}_{companyID}/conversations",
  "conversation_id": "uuid-of-conversation",
  "updated_state": {},
  "data": {}
}
```

---

## 5. **Additional Services**

### Task Manager API
- **Environment Variable**: `REACT_APP_TASK_MANAGER_API_BASE_URL`
- **API Key Variable**: `REACT_APP_TASK_MANAGER_API_KEY`
- **Staging**: `REACT_APP_TASK_MANAGER_API_BASE_URL_STAGING_AP_SOUTH_1`
- **Production US-EAST-1**: `REACT_APP_TASK_MANAGER_API_BASE_URL_PROD_US_EAST_1`
- **Production AP-SOUTH-1**: `REACT_APP_TASK_MANAGER_API_BASE_URL_PROD_AP_SOUTH_1`

### Query Engine API
- **Environment Variable**: `REACT_APP_QUERY_ENGINE_API_BASE_URL`
- **API Key Variable**: `REACT_APP_QUERY_ENGINE_API_KEY`
- **Staging**: `REACT_APP_QUERY_ENGINE_API_BASE_URL_STAGING_AP_SOUTH_1`
- **Production US-EAST-1**: `REACT_APP_QUERY_ENGINE_API_BASE_URL_PROD_US_EAST_1`
- **Production AP-SOUTH-1**: `REACT_APP_QUERY_ENGINE_API_BASE_URL_PROD_AP_SOUTH_1`

---

## 6. **Environment Files Location**

The application does **NOT** use `.env` files in the repository. All environment variables are:
1. **Injected at build time** via Docker ARG/ENV in [Dockerfile](Dockerfile)
2. **Stored as GitHub Secrets** in CI/CD workflows:
   - [.github/workflows/staging.yml](.github/workflows/staging.yml)
   - [.github/workflows/prod-sso.yml](.github/workflows/prod-sso.yml)

---

## 7. **How to Update Endpoints**

### For Local Development
Create a `.env.local` file in the project root:
```env
REACT_APP_IDENTITY_GATEWAY_URL=http://localhost:8080
REACT_APP_VIBE_BASE_URL=localhost:8000
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_API_KEY=your-api-key-here
```

### For Staging/Production Deployment
Update the GitHub Secrets in repository settings:
- `VIBE_BASE_URL_STAGING_AP_SOUTH_1`
- `VIBE_BASE_URL_PROD_US_EAST_1`
- `VIBE_BASE_URL_PROD_AP_SOUTH_1`
- `REACT_APP_IDENTITY_GATEWAY_URL_STAGING`
- `PROD_US_EAST_1_REACT_APP_API_BASE_URL`
- etc.

---

## 8. **Full Environment Variable List**

```bash
# Identity & Auth
REACT_APP_IDENTITY_GATEWAY_URL=https://identity-gateway.truegradient.ai

# Vibe Backend (WebSocket + Token Generation)
REACT_APP_VIBE_BASE_URL=vibe-backend.truegradient.ai

# Main Backend API (Conversations, Credits, Experiments)
REACT_APP_API_BASE_URL=https://api.truegradient.ai
REACT_APP_API_KEY=your-api-key

# AWS Configuration
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_IDENTITY_POOL_ID=your-pool-id
REACT_APP_AWS_BUCKET_NAME=your-bucket-name

# Task Manager
REACT_APP_TASK_MANAGER_API_BASE_URL=https://task-manager.truegradient.ai
REACT_APP_TASK_MANAGER_API_KEY=your-task-manager-key

# Query Engine
REACT_APP_QUERY_ENGINE_API_BASE_URL=https://query-engine.truegradient.ai
REACT_APP_QUERY_ENGINE_API_KEY=your-query-engine-key

# Other
REACT_APP_JWT_SECRET=your-jwt-secret
REACT_APP_ENV=production
```

---

## 9. **Testing Endpoints**

### Create a Test Script

You can create a test script to verify all endpoints. Here's a basic template:

```javascript
// test-endpoints.js
const BASE_API = process.env.REACT_APP_API_BASE_URL;
const IDENTITY = process.env.REACT_APP_IDENTITY_GATEWAY_URL;
const VIBE_BASE = process.env.REACT_APP_VIBE_BASE_URL;

const endpoints = {
  identity: [
    { method: 'GET', path: '/health' },
  ],
  api: [
    { method: 'GET', path: '/credits' },
    { method: 'GET', path: '/conversationByCompany' },
    { method: 'GET', path: '/experimentByCompany' },
  ],
  vibe: [
    { method: 'POST', path: '/generate-token' },
  ],
  websocket: [
    { protocol: 'wss', path: '/workflows/stream/tg_workflow' },
  ],
};

// Run tests for each endpoint...
```

---

## 10. **Key Files Reference**

| File | Purpose |
|------|---------|
| [src/utils/apiConfig.js](src/utils/apiConfig.js) | Identity Gateway API functions |
| [src/utils/websocketConfig.js](src/utils/websocketConfig.js) | WebSocket configuration |
| [src/utils/conversations.js](src/utils/conversations.js) | Conversation CRUD operations |
| [src/utils/getAndUpdateCredits.js](src/utils/getAndUpdateCredits.js) | Credit management |
| [src/utils/getExperiments.js](src/utils/getExperiments.js) | Experiment fetching |
| [src/hooks/useWorkflowWebSocket.js](src/hooks/useWorkflowWebSocket.js) | WebSocket connection hook |
| [Dockerfile](Dockerfile) | Environment variable definitions |
| [.github/workflows/prod-sso.yml](.github/workflows/prod-sso.yml) | Production deployment config |
| [.github/workflows/staging.yml](.github/workflows/staging.yml) | Staging deployment config |

---

## Summary

**You need to provide the following Base URLs:**

1. **Identity Gateway**: `REACT_APP_IDENTITY_GATEWAY_URL`
   - Example: `https://identity-gateway.truegradient.ai`

2. **Vibe Backend**: `REACT_APP_VIBE_BASE_URL`
   - Example: `vibe-backend.truegradient.ai` (no protocol, just domain)

3. **Main API Backend**: `REACT_APP_API_BASE_URL`
   - Example: `https://api.truegradient.ai`

4. **API Key**: `REACT_APP_API_KEY`
   - Your backend API key for authentication

**WebSocket URL is automatically constructed from VIBE_BASE_URL**:
- Format: `wss://{VIBE_BASE_URL}/workflows/stream/{workflowName}?token={jwt}`

All the endpoint paths listed above are **already implemented** in the codebase and should work as-is once you provide the correct base URLs.
