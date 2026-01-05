// utils/apiProxy.js
// ⭐ CRITICAL: Custom fetch wrapper that routes through setupProxy.js
// Matches web app setup exactly: Expo web (localhost:8081) -> setupProxy -> AWS Backend

const DEV_SERVER_URL = 'http://localhost:8081';
const BACKEND_URL = 'https://api-staging-ap-south-1.truegradient.ai';

/**
 * Check if we're running in Expo web development mode
 */
const isExpoWebDev = () => {
  if (typeof window === 'undefined') return false;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isPort8081 = window.location.port === '8081';
  return isLocalhost && isPort8081;
};

/**
 * Proxy API requests to backend
 * Both web and native use the actual backend URL directly
 * No localhost proxy needed - Expo allows CORS
 */
export const getApiUrl = (endpoint) => {
  // Always use backend URL directly for both web and native
  // This ensures consistent behavior across platforms
  return `${BACKEND_URL}${endpoint}`;
};

/**
 * Enhanced fetch wrapper that automatically handles URL routing
 * Proxies through setupProxy.js for web dev
 */
export const apiProxyFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);
  console.log(`   Full URL: ${url}`);
  console.log(`   Mode: ${isExpoWebDev() ? 'WEB (proxied via setupProxy.js)' : 'NATIVE/PRODUCTION'}`);
  
  return fetch(url, options);
};
