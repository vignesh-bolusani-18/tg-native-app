# Backend Endpoint Verification Guide

## Current Configuration

Your mobile app is configured to use these base URLs:

```env
EXPO_PUBLIC_API_BASE_URL=https://api-staging-ap-south-1.truegradient.ai
EXPO_PUBLIC_VIBE_BASE_URL=vibe-gradient-api-staging-ap-south-1.truegradient.ai/api/v1
EXPO_PUBLIC_IDENTITY_GATEWAY_URL=https://identity-gateway-dev.truegradient.ai
EXPO_PUBLIC_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
```

## Endpoint Mappings

### 1. Company Management (Working ✓)

| Endpoint | Method | File | Status |
|----------|--------|------|--------|
| `/companies` | GET | `utils/getCompaniesList.js` | ✓ Implemented |
| `/company` | POST | `utils/createCompany.js` | ✓ Implemented |

**Request Format:**
```javascript
// GET /companies
Headers: {
  "x-api-key": API_KEY,
  "Authorization": "Bearer TOKEN"
}

// POST /company
Body: { name: "Company Name" }
Response: { id, name, createdAt, ... }
```

### 2. Conversation Management (Verified)

| Endpoint | Method | File | Status |
|----------|--------|------|--------|
| `/create-conversation` | POST | `utils/conversations.js` | ✓ Implemented |
| `/conversationByUser` | GET | `utils/conversations.js` | ✓ Implemented |
| `/conversationByCompany` | GET | `utils/conversations.js` | ✓ Implemented |
| `/delete-conversation` | POST | `utils/conversations.js` | ✓ Implemented |
| `/update-conversation-title` | POST | `utils/conversations.js` | ✓ Implemented |

**Request Format:**
```javascript
// POST /create-conversation
Body: { userID, companyID? }
Response: { conversationID, ... }

// GET /conversationByCompany?t=timestamp&sendHash=true
Headers: {
  "x-api-key": API_KEY,
  "Authorization": "Bearer TOKEN"
}
Response: Array or { conversations: [...] }
```

### 3. Authentication & Token Management

| Endpoint | Method | File | Status |
|----------|--------|------|--------|
| `/login` | POST | `utils/apiConfig.js` | ✓ Implemented |
| `/login/verify` | POST | `utils/apiConfig.js` | ✓ Implemented |
| `/getAuthToken` | POST | `utils/getRefreshToken.js` | ✓ Implemented |
| `/getAccessToken` | POST | `utils/getUserById.js` | ✓ Implemented |
| `/validateUser` | POST | `utils/validateUser.js` | ✓ Implemented |

**Request Format:**
```javascript
// POST /login (Identity Gateway)
Body: { email }
Response: { success, message }

// POST /login/verify (Identity Gateway)
Body: { email, otp }
Response: { accessToken, user, refreshToken }

// POST /getAuthToken
Body: { userId, companyId }
Response: { token }
```

### 4. Credits Management

| Endpoint | Method | File | Status |
|----------|--------|------|--------|
| `/credits` | GET | `utils/getAndUpdateCredits.js` | ✓ Implemented |
| `/credits` | POST | `utils/getAndUpdateCredits.js` | ✓ Implemented |

**Request Format:**
```javascript
// GET /credits?t=timestamp
Response: { credits: 100 }

// POST /credits
Body: { updateCreditsToken: "jwt-token" }
Token Payload: { action: "increment|decrement", value: 1 }
```

### 5. Agent/AI Endpoints

| Endpoint | Method | File | Status |
|----------|--------|------|--------|
| `/aiSummary` | POST | `utils/Agent Utils/chatbotFunctions.js` | ✓ Implemented |
| `/api/v1/generate-token` | POST | `hooks/useWorkflowWebSocket.js` | ✓ Implemented |

**Request Format:**
```javascript
// POST /aiSummary
Body: { relatedPayloadToken: "jwt-token" }
Token Payload: {
  llmModel, conversationId, promptLabel,
  s3FilePath, query
}
Response: { bot4Message: "jwt-token" }

// POST /api/v1/generate-token (VIBE Backend)
Params: { user_id, company_id, expires_hours }
Response: { access_token: "jwt-token" }
```

### 6. Experiments

| Endpoint | Method | File | Status |
|----------|--------|------|--------|
| `/experimentByCompany` | GET | `utils/getExperiments.js` | ✓ Implemented |

**Request Format:**
```javascript
// GET /experimentByCompany?t=timestamp&sendHash=true
Headers: {
  "x-api-key": API_KEY,
  "Authorization": "Bearer TOKEN"
}
```

## WebSocket Configuration

**URL Format:**
```
wss://vibe-gradient-api-staging-ap-south-1.truegradient.ai/api/v1/workflows/stream/tg_workflow?token={jwt}
```

**Message Format (Outgoing):**
```json
{
  "query": "user message",
  "conversation_path": "accounts/{companyName}_{companyID}/conversations",
  "conversation_id": "uuid",
  "updated_state": {},
  "data": {}
}
```

**Message Types (Incoming):**
- `ai_understanding`: AI processing the query
- `tool_call`: AI invoking a tool
- `tool_result`: Tool execution result
- `final_result`: Complete response
- `final_answer`: Final formatted answer
- `error`: Error occurred

## Common Request Headers

All API requests (except Identity Gateway) should include:
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "x-api-key": "{API_KEY}"
}
```

## Verification Steps

### 1. Test Company Endpoints
```javascript
// Test in your app
import { getCompaniesList } from './utils/getCompaniesList';
const companies = await getCompaniesList();
console.log('Companies:', companies);
```

### 2. Test Conversation Endpoints
```javascript
import { getConversationsByCompany } from './utils/conversations';
const token = await SecureStore.getItemAsync('token');
const conversations = await getConversationsByCompany({ token });
console.log('Conversations:', conversations);
```

### 3. Test WebSocket Connection
```javascript
import { useWorkflowWebSocket } from './hooks/useWorkflowWebSocket';
// Used automatically in chat components
```

## Troubleshooting

### Issue: 401 Unauthorized
- Check if token is valid and not expired
- Verify API_KEY is correct
- Ensure token has proper permissions for company

### Issue: 404 Not Found
- Verify base URL is correct
- Check endpoint path matches backend
- Ensure no trailing slashes

### Issue: Company endpoints failing
- Ensure user is authenticated
- Check if refresh_token_company is set
- Verify company ID is valid

### Issue: WebSocket connection fails
- Check VIBE_BASE_URL format (no protocol prefix)
- Verify JWT token is generated with correct permissions
- Ensure WebSocket URL includes /api/v1 path

## Backend Integration Checklist

✅ Company Management (`/companies`, `/company`)
✅ Conversation Management (CRUD operations)
✅ Authentication (`/login`, `/login/verify`)
✅ Token Management (`/getAuthToken`)
✅ Credits Management (`/credits`)
✅ AI Summary (`/aiSummary`)
✅ WebSocket Streaming (`wss://...`)
✅ Experiment Management (`/experimentByCompany`)

## Testing Script

Run the verification script:
```bash
npm run verify-endpoints
```

This will check:
- Environment variables configuration
- Endpoint implementation coverage
- Request/Response format documentation
- Common issues and solutions
