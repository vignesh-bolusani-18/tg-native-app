/**
 * Test script to directly call the experiments API
 * Run with: node scripts/test-experiments-api.js
 */

const https = require('https');

// Company ID from your logs
const COMPANY_ID = '5dfb7ae7-41ad-4922-bdf2-952139c2d42c';
const BASE_URL = 'https://api-staging-ap-south-1.truegradient.ai';

// You'll need to paste your access token here (from the logs)
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';

async function testExperimentsAPI() {
  console.log('🧪 Testing Experiments API');
  console.log('=' .repeat(60));
  console.log(`Company ID: ${COMPANY_ID}`);
  console.log(`Endpoint: ${BASE_URL}/experimentByCompany`);
  console.log('=' .repeat(60));
  console.log('');

  const timestamp = Date.now();
  const url = `${BASE_URL}/experimentByCompany?companyID=${COMPANY_ID}&t=${timestamp}&sendHash=true`;

  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📊 Response Headers:`, res.headers);
        console.log('');
        console.log('📦 Raw Response Body:');
        console.log(data);
        console.log('');
        
        try {
          const parsed = JSON.parse(data);
          console.log('📦 Parsed Response:');
          console.log(JSON.stringify(parsed, null, 2));
          console.log('');
          console.log('📊 Response Analysis:');
          console.log(`   Type: ${typeof parsed}`);
          console.log(`   Is Array: ${Array.isArray(parsed)}`);
          console.log(`   Keys: ${parsed ? Object.keys(parsed).join(', ') : 'null'}`);
          console.log(`   Has 'experiments': ${parsed && 'experiments' in parsed}`);
          console.log(`   Has 'data': ${parsed && 'data' in parsed}`);
          
          if (parsed && parsed.experiments) {
            console.log(`   experiments.length: ${parsed.experiments.length}`);
            if (parsed.experiments.length > 0) {
              console.log(`   First experiment keys: ${Object.keys(parsed.experiments[0]).join(', ')}`);
              console.log(`   First experiment:`, JSON.stringify(parsed.experiments[0], null, 2));
            }
          } else if (Array.isArray(parsed)) {
            console.log(`   Array length: ${parsed.length}`);
            if (parsed.length > 0) {
              console.log(`   First item keys: ${Object.keys(parsed[0]).join(', ')}`);
              console.log(`   First item:`, JSON.stringify(parsed[0], null, 2));
            }
          }
          
          resolve(parsed);
        } catch (err) {
          console.error('❌ Error parsing JSON:', err.message);
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Run the test
testExperimentsAPI()
  .then(() => {
    console.log('');
    console.log('✅ Test completed');
  })
  .catch((err) => {
    console.error('');
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  });
