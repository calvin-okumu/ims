#!/usr/bin/env node

// Simple API connectivity test script
require('dotenv').config({ path: '.env.local' });

const axios = require('axios');

console.log('🔍 Testing ZKBio API Configuration...\n');

// Check environment variables
const apiUrl = process.env.NEXT_PUBLIC_ZKBIO_API_URL;
const apiToken = process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN;

console.log('📋 Environment Variables:');
console.log('   API URL:', apiUrl || '❌ NOT SET');
console.log('   API Token:', apiToken ? `✅ Set (${apiToken.length} characters)` : '❌ NOT SET');

if (!apiUrl || !apiToken) {
  console.log('\n❌ Configuration Issues Found:');
  if (!apiUrl) console.log('   • NEXT_PUBLIC_ZKBIO_API_URL is not set');
  if (!apiToken) console.log('   • NEXT_PUBLIC_ZKBIO_API_TOKEN is not set');
  console.log('\n💡 To fix:');
  console.log('   1. Copy .env.local.example to .env.local');
  console.log('   2. Update the values in .env.local');
  console.log('   3. Restart your development server');
  process.exit(1);
}

// Test API connectivity
console.log('\n🌐 Testing API Connectivity...');

const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`
  }
});

async function testApi() {
  try {
    console.log('   📡 Testing connection to:', apiUrl);
    
    // Test basic connectivity
    const response = await apiClient.get('/person');
    
    console.log('   ✅ API is accessible!');
    console.log('   📊 Response Status:', response.status);
    console.log('   📦 Data Received:', !!response.data);
    
    if (response.data && Array.isArray(response.data)) {
      console.log('   👥 Persons found:', response.data.length);
    }
    
    // Test another endpoint
    try {
      const doorResponse = await apiClient.get('/reader');
      console.log('   🚪 Doors endpoint accessible:', doorResponse.status);
      if (doorResponse.data && Array.isArray(doorResponse.data)) {
        console.log('   🚪 Doors found:', doorResponse.data.length);
      }
    } catch (doorError) {
      console.log('   ⚠️  Doors endpoint error:', doorError.response?.status || doorError.message);
    }
    
    console.log('\n🎉 API Test Results:');
    console.log('   ✅ Connection: Successful');
    console.log('   ✅ Authentication: Valid');
    console.log('   ✅ Endpoints: Accessible');
    console.log('\n🚀 Your API is ready for use!');
    
  } catch (error) {
    console.log('   ❌ API Test Failed');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   🔌 Connection refused - Server may be down');
      console.log('   💡 Check if ZKBio server is running at:', apiUrl);
    } else if (error.code === 'ENOTFOUND') {
      console.log('   🔍 Host not found - Invalid URL');
      console.log('   💡 Verify the API URL in your .env.local');
    } else if (error.response?.status === 401) {
      console.log('   🔐 Authentication failed - Invalid token');
      console.log('   💡 Check your NEXT_PUBLIC_ZKBIO_API_TOKEN');
    } else if (error.response?.status === 404) {
      console.log('   📭 Endpoint not found - API version mismatch');
      console.log('   💡 Your ZKBio version may not support these endpoints');
    } else {
      console.log('   ❓ Unknown error:', error.message);
      console.log('   📋 Error details:', {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });
    }
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('   1. Verify ZKBio server is running');
    console.log('   2. Check API URL in .env.local');
    console.log('   3. Validate API token in .env.local');
    console.log('   4. Test with curl: curl -H "Authorization: Bearer YOUR_TOKEN" ' + apiUrl + '/person');
    
    process.exit(1);
  }
}

testApi();