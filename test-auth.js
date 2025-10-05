#!/usr/bin/env node

/**
 * Authentication API Test Suite
 * Tests all authentication endpoints and middleware
 */

const API_BASE = 'http://localhost:3001/api/auth';

// Test data
const testUser = {
  email: 'testuser@quizbowlhub.test',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

const adminUser = {
  email: 'admin@quizbowlhub.dev',
  password: 'admin123'
};

let authToken = '';
let adminToken = '';

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  console.log(`${options.method || 'GET'} ${url}`);
  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(data, null, 2));
  console.log('---');
  
  return { response, data };
}

async function testRegistration() {
  console.log('🔐 Testing User Registration...\n');
  
  const { response, data } = await makeRequest(`${API_BASE}/register`, {
    method: 'POST',
    body: JSON.stringify(testUser),
  });

  if (response.status === 201 && data.success) {
    authToken = data.token;
    console.log('✅ Registration successful');
    console.log(`🎫 Token: ${authToken.substring(0, 20)}...`);
  } else {
    console.log('❌ Registration failed');
  }
  
  console.log('\n');
}

async function testLogin() {
  console.log('🔑 Testing User Login...\n');
  
  const { response, data } = await makeRequest(`${API_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  if (response.status === 200 && data.success) {
    authToken = data.token;
    console.log('✅ Login successful');
  } else {
    console.log('❌ Login failed');
  }
  
  console.log('\n');
}

async function testAdminLogin() {
  console.log('👑 Testing Admin Login...\n');
  
  const { response, data } = await makeRequest(`${API_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify(adminUser),
  });

  if (response.status === 200 && data.success) {
    adminToken = data.token;
    console.log('✅ Admin login successful');
  } else {
    console.log('❌ Admin login failed');
  }
  
  console.log('\n');
}

async function testProtectedEndpoint() {
  console.log('🛡️ Testing Protected Endpoint (/me)...\n');
  
  const { response, data } = await makeRequest(`${API_BASE}/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (response.status === 200 && data.success) {
    console.log('✅ Protected endpoint access successful');
    console.log(`👤 User: ${data.user.firstName} ${data.user.lastName} (${data.user.role})`);
  } else {
    console.log('❌ Protected endpoint access failed');
  }
  
  console.log('\n');
}

async function testAdminEndpoint() {
  console.log('👑 Testing Admin-Only Endpoint...\n');
  
  // Test with regular user token (should fail)
  console.log('Testing with regular user token:');
  const { response: userResponse } = await makeRequest(`${API_BASE}/admin-test`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (userResponse.status === 403) {
    console.log('✅ Correctly denied access to regular user');
  } else {
    console.log('❌ Should have denied access to regular user');
  }
  
  // Test with admin token (should succeed)
  console.log('\nTesting with admin token:');
  const { response: adminResponse, data: adminData } = await makeRequest(`${API_BASE}/admin-test`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  if (adminResponse.status === 200 && adminData.success) {
    console.log('✅ Admin access granted successfully');
  } else {
    console.log('❌ Admin access failed');
  }
  
  console.log('\n');
}

async function testUnauthorizedAccess() {
  console.log('🚫 Testing Unauthorized Access...\n');
  
  const { response } = await makeRequest(`${API_BASE}/me`);

  if (response.status === 401) {
    console.log('✅ Correctly denied unauthorized access');
  } else {
    console.log('❌ Should have denied unauthorized access');
  }
  
  console.log('\n');
}

async function testInvalidToken() {
  console.log('🎫 Testing Invalid Token...\n');
  
  const { response } = await makeRequest(`${API_BASE}/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid-token-here',
    },
  });

  if (response.status === 403 || response.status === 401) {
    console.log('✅ Correctly rejected invalid token');
  } else {
    console.log('❌ Should have rejected invalid token');
  }
  
  console.log('\n');
}

async function runTests() {
  console.log('🚀 QuizBowlHub Authentication API Test Suite\n');
  console.log('='.repeat(50));
  console.log('\n');

  try {
    await testRegistration();
    await testLogin();
    await testAdminLogin();
    await testProtectedEndpoint();
    await testAdminEndpoint();
    await testUnauthorizedAccess();
    await testInvalidToken();
    
    console.log('🎉 Test suite completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Only run if this script is called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };