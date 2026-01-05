// setupProxy.js
// ⭐ CRITICAL: Configure proxy to bypass CORS for local development
// This allows http://localhost:8081 to proxy requests to backend API

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all API endpoints to backend
  app.use(
    [
      '/conversation',
      '/conversations',
      '/renameConversation',
      '/conversationByCompany',
      '/api',
      '/validateUser',        // Add validateUser endpoint
      '/getAccessToken',      // Add token exchange endpoint
      '/companies',           // Add companies endpoint
      '/company',             // Add company creation endpoint
      '/user',                // Add user registration endpoint
      '/getRefreshToken',     // Add refresh token endpoint
    ],
    createProxyMiddleware({
      target: 'https://api-staging-ap-south-1.truegradient.ai',  // AWS Staging Backend
      changeOrigin: true,     // THIS IS THE MAGIC - Tells backend that origin is correct
      logLevel: 'debug',      // Log proxy requests for debugging
      onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxy: ${req.method} ${req.path} -> AWS Backend`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Proxy Response: ${req.method} ${req.path} - Status ${proxyRes.statusCode}`);
      },
    })
  );
};
