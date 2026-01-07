const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    [
      '/conversation',
      '/conversations',
      '/renameConversation',
      '/conversationByCompany',
      '/api' // Added just in case
    ],
    createProxyMiddleware({
      target: 'https://api-staging-ap-south-1.truegradient.ai',
      changeOrigin: true,
    })
  );
};
