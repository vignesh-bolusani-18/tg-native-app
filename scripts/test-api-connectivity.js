const https = require('https');
const http = require('http');

const endpoints = [
  'https://vibe-backend.truegradient.ai/health',
  'http://192.168.1.5:8000/health',
  'http://localhost:8000/health'
];

console.log('🔍 Testing API Connectivity...\n');

endpoints.forEach(url => {
  const protocol = url.startsWith('https') ? https : http;
  
  const req = protocol.get(url, (res) => {
    console.log(`✅ [${res.statusCode}] ${url}`);
    res.on('data', () => {}); // Consume data
  }).on('error', (e) => {
    console.log(`❌ [ERROR] ${url}: ${e.message}`);
  });
  
  req.setTimeout(5000, () => {
    req.destroy();
    console.log(`⏱️ [TIMEOUT] ${url}`);
  });
});
