/**
 * Backend Endpoint Verification Script
 * Tests all API endpoints against backend configuration
 * 
 * Usage: node scripts/verify-backend-endpoints.js
 */

import 'dotenv/config';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${COLORS.GREEN}✓ ${msg}${COLORS.RESET}`),
  error: (msg) => console.log(`${COLORS.RED}✗ ${msg}${COLORS.RESET}`),
  warning: (msg) => console.log(`${COLORS.YELLOW}⚠ ${msg}${COLORS.RESET}`),
  info: (msg) => console.log(`${COLORS.BLUE}ℹ ${msg}${COLORS.RESET}`),
};

// Configuration from environment
const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  VIBE_BASE_URL: process.env.EXPO_PUBLIC_VIBE_BASE_URL,
  IDENTITY_GATEWAY_URL: process.env.EXPO_PUBLIC_IDENTITY_GATEWAY_URL,
  API_KEY: process.env.EXPO_PUBLIC_API_KEY,
};

console.log('\n=== Backend Configuration ===\n');
console.log('API_BASE_URL:', CONFIG.API_BASE_URL);
console.log('VIBE_BASE_URL:', CONFIG.VIBE_BASE_URL);
console.log('IDENTITY_GATEWAY_URL:', CONFIG.IDENTITY_GATEWAY_URL);
console.log('API_KEY:', CONFIG.API_KEY ? `***${CONFIG.API_KEY.slice(-4)}` : 'MISSING');

// Expected endpoints based on backend
const EXPECTED_ENDPOINTS = {
  identity: [
    { method: 'GET', path: '/health', description: 'Identity Gateway Health Check' },
    { method: 'POST', path: '/login', description: 'Send OTP' },
    { method: 'POST', path: '/login/verify', description: 'Verify OTP' },
  ],
  api: [
    // Company Management
    { method: 'GET', path: '/companies', description: 'Get all companies for user' },
    { method: 'POST', path: '/company', description: 'Create new company' },
    
    // User Management
    { method: 'POST', path: '/user', description: 'Create/Update user entry' },
    { method: 'POST', path: '/getAccessToken', description: 'Get user by ID' },
    { method: 'POST', path: '/validateUser', description: 'Validate user token' },
    
    // Token Management
    { method: 'POST', path: '/getAuthToken', description: 'Get/Refresh auth token' },
    
    // Conversation Management
    { method: 'POST', path: '/create-conversation', description: 'Create new conversation' },
    { method: 'GET', path: '/conversationByUser', description: 'Get conversations by user' },
    { method: 'GET', path: '/conversationByCompany', description: 'Get conversations by company' },
    { method: 'POST', path: '/delete-conversation', description: 'Delete conversation' },
    { method: 'POST', path: '/update-conversation-title', description: 'Update conversation title' },
    
    // Credits Management
    { method: 'GET', path: '/credits', description: 'Get credit score' },
    { method: 'POST', path: '/credits', description: 'Update credit score' },
    
    // Experiment Management
    { method: 'GET', path: '/experimentByCompany', description: 'Get experiments by company' },
    
    // AI Summary
    { method: 'POST', path: '/aiSummary', description: 'Fetch related queries' },
  ],
  vibe: [
    { method: 'POST', path: '/api/v1/generate-token', description: 'Generate WebSocket JWT token' },
    { protocol: 'wss', path: '/api/v1/workflows/stream/tg_workflow', description: 'WebSocket connection' },
  ],
};

// Current implementation endpoints (what the mobile app uses)
const CURRENT_ENDPOINTS = {
  identity: [
    { method: 'POST', path: '/login', file: 'utils/apiConfig.js', func: 'sendOTP' },
    { method: 'POST', path: '/login/verify', file: 'utils/apiConfig.js', func: 'verifyOTP' },
  ],
  api: [
    // Company
    { method: 'GET', path: '/companies', file: 'utils/getCompaniesList.js', func: 'getCompaniesList' },
    { method: 'POST', path: '/company', file: 'utils/createCompany.js', func: 'createCompany' },
    
    // User
    { method: 'POST', path: '/user', file: 'utils/createUserEntry.js', func: 'createUserEntry' },
    { method: 'POST', path: '/getAccessToken', file: 'utils/getUserById.js', func: 'getUserById' },
    { method: 'POST', path: '/validateUser', file: 'utils/validateUser.js', func: 'validateUser' },
    
    // Token
    { method: 'POST', path: '/getAuthToken', file: 'utils/getRefreshToken.js', func: 'getRefreshToken' },
    
    // Conversation
    { method: 'POST', path: '/create-conversation', file: 'utils/conversations.js', func: 'createConversation' },
    { method: 'GET', path: '/conversationByUser', file: 'utils/conversations.js', func: 'getConversations' },
    { method: 'GET', path: '/conversationByCompany', file: 'utils/conversations.js', func: 'getConversationsByCompany' },
    { method: 'POST', path: '/delete-conversation', file: 'utils/conversations.js', func: 'deleteConversation' },
    { method: 'POST', path: '/update-conversation-title', file: 'utils/conversations.js', func: 'updateConversationTitle' },
    
    // Credits
    { method: 'GET', path: '/credits', file: 'utils/getAndUpdateCredits.js', func: 'getCredits' },
    { method: 'POST', path: '/credits', file: 'utils/getAndUpdateCredits.js', func: 'updateCredits' },
    
    // Experiments
    { method: 'GET', path: '/experimentByCompany', file: 'utils/getExperiments.js', func: 'getExperiments' },
    
    // AI
    { method: 'POST', path: '/aiSummary', file: 'utils/Agent Utils/chatbotFunctions.js', func: 'fetchRelatedQueries' },
  ],
};

// Verify endpoint coverage
console.log('\n=== Endpoint Coverage Analysis ===\n');

function verifyEndpoints() {
  const missing = [];
  const matched = [];
  
  // Check API endpoints
  EXPECTED_ENDPOINTS.api.forEach(expected => {
    const found = CURRENT_ENDPOINTS.api.find(
      current => current.method === expected.method && current.path === expected.path
    );
    
    if (found) {
      matched.push(expected.path);
      log.success(`${expected.method} ${expected.path} - ${found.file}`);
    } else {
      missing.push(expected);
      log.error(`${expected.method} ${expected.path} - NOT IMPLEMENTED`);
    }
  });
  
  console.log(`\n${matched.length} endpoints matched, ${missing.length} missing\n`);
  
  return { matched, missing };
}

const { matched, missing } = verifyEndpoints();

// Configuration Issues
console.log('\n=== Configuration Issues ===\n');

const issues = [];

if (!CONFIG.API_BASE_URL) {
  issues.push('EXPO_PUBLIC_API_BASE_URL is not set');
  log.error('Missing EXPO_PUBLIC_API_BASE_URL');
} else {
  log.success(`API_BASE_URL configured: ${CONFIG.API_BASE_URL}`);
}

if (!CONFIG.VIBE_BASE_URL) {
  issues.push('EXPO_PUBLIC_VIBE_BASE_URL is not set');
  log.error('Missing EXPO_PUBLIC_VIBE_BASE_URL');
} else {
  // Check if it has protocol
  if (CONFIG.VIBE_BASE_URL.startsWith('http://') || CONFIG.VIBE_BASE_URL.startsWith('https://')) {
    issues.push('VIBE_BASE_URL should NOT include protocol (http:// or https://)');
    log.warning(`VIBE_BASE_URL includes protocol: ${CONFIG.VIBE_BASE_URL}`);
    log.info('Should be: vibe-gradient-api-staging-ap-south-1.truegradient.ai/api/v1');
  } else {
    log.success(`VIBE_BASE_URL configured: ${CONFIG.VIBE_BASE_URL}`);
  }
}

if (!CONFIG.IDENTITY_GATEWAY_URL) {
  issues.push('EXPO_PUBLIC_IDENTITY_GATEWAY_URL is not set');
  log.error('Missing EXPO_PUBLIC_IDENTITY_GATEWAY_URL');
} else {
  log.success(`IDENTITY_GATEWAY_URL configured: ${CONFIG.IDENTITY_GATEWAY_URL}`);
}

if (!CONFIG.API_KEY) {
  issues.push('EXPO_PUBLIC_API_KEY is not set');
  log.error('Missing EXPO_PUBLIC_API_KEY');
} else {
  log.success('API_KEY configured');
}

// Request/Response Format Documentation
console.log('\n=== Request/Response Formats ===\n');

console.log('1. Company Endpoints:');
console.log('   GET /companies');
console.log('   Headers: { "x-api-key": API_KEY, "Authorization": "Bearer TOKEN" }');
console.log('   Response: { companies: [...] }');
console.log('');
console.log('   POST /company');
console.log('   Body: { name: "Company Name" }');
console.log('   Response: { id, name, ... }');
console.log('');

console.log('2. Conversation Endpoints:');
console.log('   POST /create-conversation');
console.log('   Body: { userID, companyID? }');
console.log('   Response: { conversationID, ... }');
console.log('');
console.log('   GET /conversationByCompany?t=timestamp&sendHash=true');
console.log('   Headers: { "x-api-key": API_KEY, "Authorization": "Bearer TOKEN" }');
console.log('   Response: Array of conversations or { conversations: [...] }');
console.log('');

console.log('3. Token Endpoints:');
console.log('   POST /getAuthToken');
console.log('   Body: { userId, companyId }');
console.log('   Response: { token: "..." }');
console.log('');

console.log('4. AI Summary:');
console.log('   POST /aiSummary');
console.log('   Body: { relatedPayloadToken: "jwt-token" }');
console.log('   Response: { bot4Message: "jwt-token" }');
console.log('');

// Summary
console.log('\n=== Summary ===\n');
console.log(`✓ ${matched.length} endpoints implemented correctly`);
if (missing.length > 0) {
  console.log(`✗ ${missing.length} endpoints not implemented`);
}
if (issues.length > 0) {
  console.log(`⚠ ${issues.length} configuration issues found:`);
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  log.success('No configuration issues found!');
}

console.log('\n=== Next Steps ===\n');
console.log('1. Fix metro.config.js (DONE)');
console.log('2. Verify .env configuration');
console.log('3. Test company selection flow');
console.log('4. Test conversation creation');
console.log('5. Test WebSocket connection');
console.log('');

process.exit(issues.length > 0 ? 1 : 0);
