#!/usr/bin/env node

/**
 * Simple test script for Whiskey Proxy
 * Run with: node test-proxy.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.PROXY_URL || 'http://localhost:3000';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data, status: res.statusCode });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🥃 Testing Whiskey Proxy Service...\n');
  
  try {
    // Test 1: Basic proxy request
    console.log('1. Testing basic proxy request...');
    const proxyTest = await makeRequest(`${BASE_URL}/api/proxy?url=https://httpbin.org/ip`);
    console.log('✅ Proxy request successful');
    console.log(`   Response time: ${proxyTest.responseTime}ms`);
    console.log(`   Proxy used: ${proxyTest.proxy.host}:${proxyTest.proxy.port} (${proxyTest.proxy.type})`);
    console.log(`   Target IP: ${proxyTest.data.origin}\n`);
    
    // Test 2: Proxy statistics
    console.log('2. Testing proxy statistics...');
    const stats = await makeRequest(`${BASE_URL}/api/proxy-stats`);
    console.log('✅ Statistics retrieved');
    console.log(`   Total proxies: ${stats.overview.total}`);
    console.log(`   Healthy proxies: ${stats.overview.healthy}`);
    console.log(`   Health rate: ${Math.round(stats.overview.healthPercentage)}%\n`);
    
    // Test 3: Proxy information
    console.log('3. Testing proxy information...');
    const info = await makeRequest(`${BASE_URL}/api/proxy-info?limit=5`);
    console.log('✅ Proxy information retrieved');
    console.log(`   Available countries: ${info.filters.countries.slice(0, 5).join(', ')}...`);
    console.log(`   Proxy types: ${info.filters.types.join(', ')}\n`);
    
    // Test 4: Proxy testing
    console.log('4. Testing proxy performance...');
    const test = await makeRequest(`${BASE_URL}/api/proxy-test?count=3`);
    console.log('✅ Proxy testing completed');
    console.log(`   Tests run: ${test.summary.total}`);
    console.log(`   Success rate: ${Math.round(test.summary.successRate)}%`);
    console.log(`   Average response time: ${test.summary.avgResponseTime}ms\n`);
    
    console.log('🎉 All tests passed! Whiskey Proxy is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the service is running (npm run dev)');
    console.error('2. Check that all dependencies are installed (npm install)');
    console.error('3. Verify the BASE_URL is correct');
    process.exit(1);
  }
}

// Run tests
runTests();
